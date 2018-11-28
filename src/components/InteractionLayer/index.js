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
    areas: PropTypes.arrayOf(areaPropType),
    annotations: PropTypes.arrayOf(annotationPropType),
    width: PropTypes.number.isRequired,
    zoomAxes: GriffPropTypes.zoomAxes.isRequired,

    // These are all populated by Griff.
    series: seriesPropType,
    collections: GriffPropTypes.collections,
    timeSubDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    timeDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    subDomainsByItemId: GriffPropTypes.subDomainsByItemId.isRequired,
    // (domain, width) => [number, number]
    xScalerFactory: PropTypes.func.isRequired,
  };

  static defaultProps = {
    areas: [],
    annotations: [],
    collections: [],
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
      timeLabel: () => {},
      yLabel: () => {},
      timestamp: null,
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

  componentDidMount() {
    if (this.props.ruler.timestamp) {
      this.setRulerPosition(this.props.ruler.timestamp);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      // FIXME: Migrate this to `subDomainsByItemId`.
      timeSubDomain: prevTimeSubDomain,
      subDomainsByItemId: prevSubDomainsByItemId,
      ruler,
      xScalerFactory,
      width: prevWidth,
    } = this.props;
    // FIXME: Don't assume a single time domain
    const {
      timeSubDomain: nextTimeSubDomain,
      width: nextWidth,
      subDomainsByItemId: nextSubDomainsByItemId,
    } = nextProps;
    const { touchX, touchY } = this.state;

    if (
      ruler &&
      ruler.visible &&
      touchX !== null &&
      (!isEqual(prevTimeSubDomain, nextTimeSubDomain) ||
        prevWidth !== nextWidth ||
        !isEqual(prevSubDomainsByItemId, nextSubDomainsByItemId))
    ) {
      // keep track on ruler on subdomain update
      const prevXScale = xScalerFactory(prevTimeSubDomain, prevWidth);
      const curXScale = xScalerFactory(nextTimeSubDomain, nextWidth);
      const ts = prevXScale.invert(touchX).getTime();
      const newXPos = curXScale(ts);

      // hide ruler if point went out to the left of subdomain
      if (newXPos < 0) {
        this.setState({
          points: [],
          touchX: null,
          touchY: null,
        });
      } else if (this.touchMoving) {
        // ruler should not follow points during panning and zooming on mobile
        this.processMouseMove(touchX, touchY);
      } else {
        // ruler should follow points during live loading and
        // panning and zooming on desktop
        this.setState({ touchX: newXPos }, () => {
          this.processMouseMove(newXPos, touchY);
        });
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

    if (this.props.ruler.timestamp !== prevProps.ruler.timestamp) {
      this.setRulerPosition(this.props.ruler.timestamp);
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
      this.processMouseMove(xpos, ypos, e);
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
      this.setState({
        points: [],
        touchX: null,
        touchY: null,
      });
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

  onTouchMove = () => {
    this.touchMoving = true;
  };

  onTouchMoveEnd = () => {
    this.touchMoving = false;
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
      if (x0) {
        // If there is a point *before* the cursor position, then that should
        // be used since it was the last-known value, and extrapolating into the
        // future can be misleading (and incorrect).
        d = x0;
      } else if (x1) {
        // But if we only have a point under the cursor, go ahead and use that.
        d = x1;
      } else {
        // Otherwise, just use nothing.
        d = null;
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

  getRulerPoints = xpos => {
    const {
      series,
      height,
      width,
      subDomainsByItemId,
      xScalerFactory,
      // FIXME: Migrate this to `subDomainsByItemId`.
      timeSubDomain,
    } = this.props;
    const newPoints = [];
    series.forEach(s => {
      if (!subDomainsByItemId[s.id]) {
        return;
      }
      const { [Axes.y]: ySubDomain } = subDomainsByItemId[s.id];
      const xScale = xScalerFactory(timeSubDomain, width);
      const rawTimestamp = xScale.invert(xpos).getTime();
      const { data, xAccessor, yAccessor } = s;
      const rawX = d3.bisector(xAccessor).left(data, rawTimestamp, 1);
      const x0 = data[rawX - 1];
      const x1 = data[rawX];
      let d = null;
      if (x0) {
        // If there is a point *before* the cursor position, then that should
        // be used since it was the last-known value, and extrapolating into the
        // future can be misleading (and incorrect).
        d = x0;
      } else if (x1) {
        // But if we only have a point under the cursor, go ahead and use that.
        d = x1;
      } else {
        // Otherwise, just use nothing.
        d = null;
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
      }
    });
    return newPoints;
  };

  setRulerPosition = timestamp => {
    if (!timestamp) {
      this.setState({
        points: [],
        touchX: null,
        touchY: null,
      });
      return;
    }
    const { xScalerFactory, width, timeSubDomain } = this.props;
    const xScale = xScalerFactory(timeSubDomain, width);
    const xpos = xScale(timestamp);
    this.setRulerPoints(xpos);
    this.setState({
      touchX: xpos,
    });
  };

  setRulerPoints = xpos => {
    const rulerPoints = this.getRulerPoints(xpos);
    this.setState({ points: rulerPoints });

    return rulerPoints;
  };

  setArea = (xpos, ypos) => {
    const { area } = this.state;
    if (!area) {
      return;
    }
    const output = this.getDataForCoordinate(xpos, ypos, true);
    this.setState({
      area: {
        ...area,
        end: output,
      },
    });
  };

  processMouseMove = (xpos, ypos, e = null) => {
    const rulerPoints = this.setRulerPoints(xpos);
    this.setArea(xpos, ypos);
    const { onMouseMove } = this.props;
    if (onMouseMove) {
      onMouseMove({ points: rulerPoints, xpos, ypos, e });
    }
  };

  render() {
    const {
      collections,
      height,
      crosshair,
      onAreaDefined,
      ruler,
      series,
      subDomainsByItemId,
      width,
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
          itemIds={series.map(s => s.id).concat(collections.map(c => c.id))}
          onTouchMove={this.onTouchMove}
          onTouchMoveEnd={this.onTouchMoveEnd}
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
      collections,
      series,
      xScalerFactory,
      subDomainsByItemId,
    }) => (
      <InteractionLayer
        {...props}
        // FIXME: Remove this crap
        timeSubDomain={timeSubDomain}
        timeDomain={timeDomain}
        collections={collections}
        series={series}
        xScalerFactory={xScalerFactory}
        subDomainsByItemId={subDomainsByItemId}
      />
    )}
  </ScalerContext.Consumer>
);
