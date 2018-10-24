import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import isEqual from 'lodash.isequal';
import ScalerContext from '../../context/Scaler';
import { createYScale } from '../../utils/scale-helpers';
import GriffPropTypes, {
  areaPropType,
  seriesPropType,
  annotationPropType,
  rulerPropType,
} from '../../utils/proptypes';
import Annotation from '../Annotation';
import Ruler from '../Ruler';
import Area from '../Area';
import ZoomRect from '../ZoomRect';
import Axes from '../../utils/Axes';

export const ZoomMode = {
  X: 0,
  Y: 1,
  BOTH: 2,
};

const MINIMUM_AREA_DIMENSION_PIXELS = 30;
const isLargeEnough = area =>
  Math.abs(area.start.xpos - area.end.xpos) > MINIMUM_AREA_DIMENSION_PIXELS ||
  Math.abs(area.start.ypos - area.end.ypos) > MINIMUM_AREA_DIMENSION_PIXELS;

class InteractionLayer extends React.Component {
  static propTypes = {
    crosshair: PropTypes.bool,
    ruler: rulerPropType,
    height: PropTypes.number.isRequired,
    // area => void
    onAreaDefined: PropTypes.func,
    // (area, xpos, ypos) => void
    onAreaClicked: PropTypes.func,
    onClick: PropTypes.func,
    onClickAnnotation: PropTypes.func,
    // event => void
    onDoubleClick: PropTypes.func,
    onMouseMove: PropTypes.func,
    onMouseOut: PropTypes.func,
    // ({ xSubDomain, transformation }) => void
    onZoomXAxis: PropTypes.func,
    series: seriesPropType,
    areas: PropTypes.arrayOf(areaPropType),
    annotations: PropTypes.arrayOf(annotationPropType),
    width: PropTypes.number.isRequired,
    zoomAxes: GriffPropTypes.zoomAxes.isRequired,

    // These are all populated by Griff.
    timeSubDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    timeDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    subDomainsByItemId: GriffPropTypes.subDomainsByItemId.isRequired,
    // (domain, width) => [number, number]
    xScalerFactory: PropTypes.func.isRequired,
  };

  static defaultProps = {
    areas: [],
    annotations: [],
    crosshair: false,
    onAreaDefined: null,
    onAreaClicked: null,
    onClick: null,
    onClickAnnotation: null,
    onDoubleClick: null,
    onMouseMove: null,
    onMouseOut: null,
    onZoomXAxis: null,
    series: [],
    ruler: {
      visible: false,
      xLabel: () => {},
      yLabel: () => {},
    },
  };

  state = {
    area: null,
    crosshair: {
      x: null,
      y: null,
    },
    points: [],
    touchX: null,
    touchY: null,
  };

  componentWillReceiveProps(nextProps) {
    const {
      subDomainsByItemId: prevSubDomainsByItemId,
      ruler,
      xScalerFactory,
    } = this.props;
    const { subDomainsByItemId: nextSubDomainsByItemId, width } = nextProps;
    const { touchX, touchY } = this.state;

    // FIXME: Don't assume a single time domain
    const prevTimeSubDomain = Axes.time(
      prevSubDomainsByItemId[Object.keys(prevSubDomainsByItemId)[0]]
    );
    const nextTimeSubDomain = Axes.time(
      nextSubDomainsByItemId[Object.keys(nextSubDomainsByItemId)[0]]
    );

    if (
      ruler &&
      ruler.visible &&
      touchX !== null &&
      !isEqual(prevTimeSubDomain, nextTimeSubDomain)
    ) {
      // keep track on ruler on subdomain update
      const prevXScale = xScalerFactory(prevTimeSubDomain, width);
      const curXScale = xScalerFactory(nextTimeSubDomain, width);
      const ts = prevXScale.invert(touchX).getTime();
      const newXPos = curXScale(ts);
      // hide ruler if point went out to the left of subdomain
      if (newXPos < 0) {
        this.setState({
          points: [],
          touchX: null,
          touchY: null,
        });
      } else if (
        // ruler should follow points during live loading
        // except when the chart is dragging firing touchmove event
        (((d3 || {}).event || {}).sourceEvent || {}).type !== 'touchmove'
      ) {
        this.setState(
          {
            touchX: newXPos,
          },
          () => this.processMouseMove(newXPos, touchY)
        );
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.onAreaDefined && !this.props.onAreaDefined) {
      // They no longer care about areas; if we're building one, then remove it.
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        area: null,
      });
    }
  }

  onMouseDown = e => {
    if (this.props.onAreaDefined) {
      this.mouseDown = true;
      const xpos = e.nativeEvent.offsetX;
      const ypos = e.nativeEvent.offsetY;
      this.setState({
        area: {
          id: Date.now(),
          start: this.getDataForCoordinate(xpos, ypos, true),
        },
      });
    }
  };

  onMouseUp = () => {
    const { onAreaDefined } = this.props;
    setTimeout(() => {
      this.mouseUp = false;
      this.dragging = false;
    }, 50);
    if (onAreaDefined) {
      const { area } = this.state;
      if (area && area.start && area.end && isLargeEnough(area)) {
        onAreaDefined(area);
      }
    }
    this.setState({ area: null });
  };

  onMouseMove = e => {
    const { series, onMouseMove, crosshair, ruler } = this.props;
    if (series.length === 0) {
      return;
    }
    const xpos = e.nativeEvent.offsetX;
    const ypos = e.nativeEvent.offsetY;
    if (crosshair) {
      this.setState({
        crosshair: {
          x: xpos,
          y: ypos,
        },
      });
    }

    const { area } = this.state;
    if (onMouseMove || (ruler && ruler.visible) || area) {
      this.processMouseMove(xpos, ypos);
      this.setState({
        touchX: xpos,
        touchY: ypos,
      });

      if (area) {
        this.dragging = true;
      }
    }
  };

  onMouseOut = e => {
    const { onMouseMove, crosshair, onMouseOut, ruler } = this.props;
    if (crosshair) {
      this.setState({
        crosshair: {
          x: null,
          y: null,
        },
      });
    }
    if (ruler && ruler.visible) {
      this.setState({ points: [] });
    }
    if (onMouseMove) {
      onMouseMove({ points: [] });
    }
    if (onMouseOut) {
      onMouseOut(e);
    }
    this.setState({ area: null });
  };

  onClick = e => {
    const {
      onClickAnnotation,
      onAreaClicked,
      onClick,
      width,
      annotations,
      areas,
      xScalerFactory,
      subDomainsByItemId,
    } = this.props;
    if (this.dragging) {
      return;
    }
    if (onClickAnnotation || onAreaClicked) {
      let notified = false;
      // FIXME: Don't assume a single time domain
      const timeSubDomain = Axes.time(
        subDomainsByItemId[Object.keys(subDomainsByItemId)[0]]
      );
      const xScale = xScalerFactory(timeSubDomain, width);
      const xpos = e.nativeEvent.offsetX;
      const ypos = e.nativeEvent.offsetY;
      const rawTimestamp = xScale.invert(xpos).getTime();
      if (onAreaClicked) {
        let stopNotifying = false;
        areas.forEach(a => {
          if (!a.start || !a.end) {
            // If we have a partial area, then we're in the middle of defining
            // a new area and this is the mouseup event. This means that we
            // should stop searching for other areas to "click" on.
            stopNotifying = true;
            return;
          }
          if (stopNotifying) {
            return;
          }
          const x =
            xpos > Math.min(a.start.xpos, a.end.xpos) &&
            xpos < Math.max(a.start.xpos, a.end.xpos);
          const y =
            ypos > Math.min(a.start.ypos, a.end.ypos) &&
            ypos < Math.max(a.start.ypos, a.end.ypos);
          if (x && y) {
            // Clicked within an area
            stopNotifying = onAreaClicked(a, xpos, ypos);
            notified = true;
          }
        });
      }
      if (onClickAnnotation) {
        annotations.forEach(a => {
          if (rawTimestamp > a.data[0] && rawTimestamp < a.data[1]) {
            // Clicked within an annotation
            onClickAnnotation(a, xpos, ypos);
            notified = true;
          }
        });
      }
      if (notified) {
        return;
      }
    }
    if (onClick) {
      onClick(e);
    }
  };

  onDoubleClick = e => {
    const { onDoubleClick } = this.props;
    if (onDoubleClick) {
      onDoubleClick(e);
    }
  };

  // TODO: This extrapolate thing is super gross and so hacky.
  getDataForCoordinate = (xpos, ypos, extrapolate = false) => {
    const {
      subDomainsByItemId,
      width,
      series,
      height,
      xScalerFactory,
    } = this.props;

    const output = { xpos, ypos, points: [] };
    series.forEach(s => {
      const {
        [Axes.time]: timeSubDomain,
        [Axes.y]: ySubDomain,
      } = subDomainsByItemId[s.id];
      const xScale = xScalerFactory(timeSubDomain, width);
      const rawTimestamp = xScale.invert(xpos).getTime();
      const { data, xAccessor, yAccessor } = s;
      const rawX = d3.bisector(xAccessor).left(data, rawTimestamp, 1);
      const x0 = data[rawX - 1];
      const x1 = data[rawX];
      let d = null;
      if (x0 && !x1) {
        d = x0;
      } else if (x1 && !x0) {
        d = x1;
      } else if (!x0 && !x1) {
        d = null;
      } else {
        d =
          rawTimestamp - xAccessor(x0) > xAccessor(x1) - rawTimestamp ? x1 : x0;
      }
      if (d) {
        let yScale = createYScale(ySubDomain, height);
        if (extrapolate) {
          yScale = d3
            .scaleLinear()
            .domain([height, 0])
            .range(ySubDomain);
        }
        const ts = xAccessor(d);
        const value = extrapolate ? ypos : yAccessor(d);
        output.points.push({
          id: s.id,
          timestamp: ts,
          value: extrapolate ? yScale(value) : value,
          x: xScale(ts),
          y: yScale(value),
        });
      } else {
        output.points.push({ id: s.id });
      }
    });
    return output;
  };

  processMouseMove = (xpos, ypos) => {
    const {
      series,
      height,
      width,
      subDomainsByItemId,
      onMouseMove,
      ruler,
      xScalerFactory,
    } = this.props;
    const newPoints = [];
    series.forEach(s => {
      const {
        [Axes.time]: timeSubDomain,
        [Axes.y]: ySubDomain,
      } = subDomainsByItemId[s.id];
      const xScale = xScalerFactory(timeSubDomain, width);
      const rawTimestamp = xScale.invert(xpos).getTime();
      const { data, xAccessor, yAccessor } = s;
      const rawX = d3.bisector(xAccessor).left(data, rawTimestamp, 1);
      const x0 = data[rawX - 1];
      const x1 = data[rawX];
      let d = null;
      if (x0 && !x1) {
        d = x0;
      } else if (x1 && !x0) {
        d = x1;
      } else if (!x0 && !x1) {
        d = null;
      } else {
        d =
          rawTimestamp - xAccessor(x0) > xAccessor(x1) - rawTimestamp ? x1 : x0;
      }
      if (d) {
        const yScale = createYScale(ySubDomain, height);
        const ts = xAccessor(d);
        const value = yAccessor(d);
        newPoints.push({
          id: s.id,
          name: s.name,
          color: s.color,
          timestamp: ts,
          rawTimestamp,
          value,
          x: xScale(ts),
          y: yScale(value),
        });
      } else {
        newPoints.push({ id: s.id });
      }
    });

    if (ruler && ruler.visible) {
      this.setState({ points: newPoints });
    }

    const { area } = this.state;
    if (area) {
      const output = this.getDataForCoordinate(xpos, ypos, true);
      this.setState({
        area: {
          ...area,
          end: output,
        },
      });
    }

    if (onMouseMove) {
      onMouseMove({ points: newPoints, xpos, ypos });
    }
  };

  render() {
    const {
      width,
      height,
      crosshair,
      onAreaDefined,
      ruler,
      series,
      subDomainsByItemId,
      xScalerFactory,
      zoomAxes,
    } = this.props;
    const {
      crosshair: { x, y },
      points,
      area,
    } = this.state;
    let lines = null;
    if (crosshair && x !== null && y !== null) {
      lines = (
        <React.Fragment>
          <line
            key="x"
            x1={0}
            x2={width}
            stroke="#0004"
            strokeWidth={1}
            y1={y}
            y2={y}
          />
          <line
            key="y"
            y1={0}
            y2={height}
            stroke="#0004"
            strokeWidth={1}
            x1={x}
            x2={x}
          />
        </React.Fragment>
      );
    }
    // FIXME: Don't rely on a single time domain
    const timeSubDomain = Axes.time(subDomainsByItemId[series[0].id]);
    const xScale = xScalerFactory(timeSubDomain, width);
    const annotations = this.props.annotations.map(a => (
      <Annotation key={a.id} {...a} height={height} xScale={xScale} />
    ));
    const areas = this.props.areas.map(a => {
      const scaledArea = {
        ...a,
      };

      let s = null;

      if (a.start.xval) {
        scaledArea.start.xpos = xScale(a.start.xval);
      }
      if (a.end.xval) {
        scaledArea.end.xpos = xScale(a.end.xval);
      }

      if (a.seriesId) {
        s = series.find(s1 => s1.id === a.seriesId);
        if (s) {
          const { [Axes.y]: ySubDomain } = subDomainsByItemId[s.id];
          const yScale = createYScale(ySubDomain, height);
          if (a.start.yval) {
            scaledArea.start.ypos = yScale(a.start.yval);
          }
          if (a.end.yval) {
            scaledArea.end.ypos = yScale(a.end.yval);
          }
        }
      }
      const color = scaledArea.color || (s ? s.color : null);
      return (
        <Area
          key={`${scaledArea.id || ''}-${scaledArea.seriesId || ''}`}
          color={color}
          {...scaledArea}
        />
      );
    });
    const areaBeingDefined = area ? (
      <Area key="user" {...area} color="#999" />
    ) : null;

    let zoomableAxes = zoomAxes;
    if (onAreaDefined) {
      zoomableAxes = {};
    }
    return (
      <React.Fragment>
        {lines}
        {annotations}
        {ruler.visible &&
          points.length && (
            <Ruler
              ruler={ruler}
              points={points}
              width={width}
              height={height}
            />
          )}
        {areas}
        {areaBeingDefined}
        <ZoomRect
          zoomAxes={zoomableAxes}
          width={width}
          height={height}
          onClick={this.onClick}
          onMouseMove={this.onMouseMove}
          onBlur={this.onMouseMove}
          onMouseOut={this.onMouseOut}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onDoubleClick={this.onDoubleClick}
          itemIds={series.map(s => s.id)}
        />
      </React.Fragment>
    );
  }
}

export default props => (
  <ScalerContext.Consumer>
    {({
      timeSubDomain,
      timeDomain,
      series,
      xScalerFactory,
      subDomainsByItemId,
      updateDomains,
    }) => (
      <InteractionLayer
        {...props}
        // FIXME: Remove this crap
        timeSubDomain={timeSubDomain}
        timeDomain={timeDomain}
        series={series}
        xScalerFactory={xScalerFactory}
        subDomainsByItemId={subDomainsByItemId}
        updateDomains={updateDomains}
      />
    )}
  </ScalerContext.Consumer>
);
