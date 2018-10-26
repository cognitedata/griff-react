import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import isEqual from 'lodash.isequal';
import ScalerContext from '../../context/Scaler';
import { createYScale } from '../../utils/scale-helpers';
import {
  areaPropType,
  seriesPropType,
  annotationPropType,
  rulerPropType,
} from '../../utils/proptypes';
import Annotation from '../Annotation';
import Ruler from '../Ruler';
import Area from '../Area';

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
    updateXTransformation: PropTypes.func,
    updateYTransformation: PropTypes.func,
    series: seriesPropType,
    areas: PropTypes.arrayOf(areaPropType),
    annotations: PropTypes.arrayOf(annotationPropType),
    width: PropTypes.number.isRequired,
    xSubDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    xDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    zoomable: PropTypes.bool,
    // (domain, width) => [number, number]
    xScalerFactory: PropTypes.func.isRequired,
    zoomMode: PropTypes.oneOf(Object.keys(ZoomMode).map(k => ZoomMode[k])),
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
    updateXTransformation: () => {},
    updateYTransformation: () => {},
    series: [],
    zoomable: true,
    ruler: {
      visible: false,
      xLabel: () => {},
      yLabel: () => {},
    },
    zoomMode: ZoomMode.X,
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
    const { width, height, xScalerFactory, ruler } = this.props;
    this.zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]]);
    this.rectSelection = d3.select(this.zoomNode);
    this.syncZoomingState();

    if (this.rectSelection.property('__zoom')) {
      const { xSubDomain, xDomain } = this.props;
      // if xSubDomain differs from xDomain on componentDidMount step that
      // means it has been specified by a user and we need to update internals
      if (!isEqual(xSubDomain, xDomain)) {
        const scale = xScalerFactory(xDomain, width);
        const selection = xSubDomain.map(scale);
        const transform = d3.zoomIdentity
          .scale(width / (selection[1] - selection[0]))
          .translate(-selection[0], 0);
        this.rectSelection.property('__zoom', transform);
      }
    }
    if (ruler && ruler.position) {
      this.setRulerPosition(ruler.position);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { xSubDomain: prevXSubDomain, ruler, xScalerFactory } = this.props;
    const { xSubDomain: curXSubDomain, width } = nextProps;
    const { touchX, touchY } = this.state;
    if (
      ruler &&
      ruler.visible &&
      touchX !== null &&
      !isEqual(prevXSubDomain, curXSubDomain)
    ) {
      // keep track on ruler on subdomain update
      const prevXScale = xScalerFactory(prevXSubDomain, width);
      const curXScale = xScalerFactory(curXSubDomain, width);
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
    // This is only updating internals -- but could still slow down performance.
    // Look into this.
    if (
      this.props.zoomable !== prevProps.zoomable ||
      // Since onAreaDefined *also* controls whether zooming is enabled, then
      // we need to treat changes in this property just like we treat changes
      // to the zooming state.
      this.props.onAreaDefined !== prevProps.onAreaDefined
    ) {
      this.syncZoomingState();
    }
    const { xSubDomain: p, xDomain: prevXDomain } = prevProps;
    const { xSubDomain: c, xDomain: curXDomain } = this.props;
    if (this.rectSelection.property('__zoom')) {
      // Checking if the existing selection has a current zoom state.
      const { width, xSubDomain, xDomain, xScalerFactory } = this.props;
      const newXDomain = !isEqual(prevXDomain, curXDomain);
      if (!isEqual(p, c) || width !== prevProps.width || newXDomain) {
        const scale = xScalerFactory(xDomain, width);
        const selection = xSubDomain.map(scale);
        const transform = d3.zoomIdentity
          .scale(width / (selection[1] - selection[0]))
          .translate(-selection[0], 0);
        const prev = this.rectSelection.property('__zoom');
        // Checking if the difference in x transform is significant.
        // This means that something else has zoomed (brush) and we need to
        // update the internals.
        // TODO: This should be optimized
        if (
          Math.abs(prev.k - transform.k) > 0.5 ||
          Math.abs(prev.x - transform.x) > 50 ||
          newXDomain
        ) {
          this.rectSelection.property('__zoom', transform);
        }
      }
    }
    if (prevProps.onAreaDefined && !this.props.onAreaDefined) {
      // They no longer care about areas; if we're building one, then remove it.
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        area: null,
      });
    }

    if (this.props.ruler.position !== prevProps.ruler.position) {
      this.setRulerPosition(this.props.ruler.position);
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
      this.processExternalMouseMove(xpos, ypos);
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
      xSubDomain,
      width,
      annotations,
      areas,
      xScalerFactory,
    } = this.props;
    if (this.dragging) {
      return;
    }
    if (onClickAnnotation || onAreaClicked) {
      let notified = false;
      const xScale = xScalerFactory(xSubDomain, width);
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
    const { xSubDomain, width, series, height, xScalerFactory } = this.props;

    const xScale = xScalerFactory(xSubDomain, width);
    const rawTimestamp = xScale.invert(xpos).getTime();
    const output = { xpos, ypos, points: [] };
    series.forEach(s => {
      const { data, xAccessor, yAccessor, yDomain } = s;
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
        let yScale = createYScale(yDomain, height);
        if (extrapolate) {
          yScale = d3
            .scaleLinear()
            .domain([height, 0])
            .range(yDomain);
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

  getRulerPoints = rawTimestamp => {
    const { series, height, xSubDomain, width, xScalerFactory } = this.props;
    const xScale = xScalerFactory(xSubDomain, width);
    const newPoints = [];
    series.forEach(s => {
      const { data, xAccessor, yAccessor, ySubDomain } = s;
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
    const { xScalerFactory, width, xSubDomain } = this.props;
    const xScale = xScalerFactory(xSubDomain, width);
    const xpos = xScale(timestamp);
    this.setRulerPoints(xpos);
    this.setState({
      touchX: xpos,
    });
  };

  setRulerPoints = xpos => {
    const { ruler, width, xSubDomain, xScalerFactory } = this.props;
    if (!ruler || !ruler.visible) {
      return [];
    }
    const xScale = xScalerFactory(xSubDomain, width);
    const rawTimestamp = xScale.invert(xpos).getTime();
    const rulerPoints = this.getRulerPoints(rawTimestamp);
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

  processExternalMouseMove = (xpos, ypos) => {
    this.processMouseMove(xpos, ypos, true);
  };

  processMouseMove = (xpos, ypos, external = false) => {
    const rulerPoints = this.setRulerPoints(xpos);
    this.setArea(xpos, ypos);
    const { onMouseMove } = this.props;
    if (onMouseMove) {
      onMouseMove({ points: rulerPoints, xpos, ypos, external });
    }
  };

  syncZoomingState = () => {
    const { onAreaDefined, onDoubleClick, zoomable } = this.props;
    if (zoomable && !onAreaDefined) {
      this.rectSelection.call(this.zoom.on('zoom', this.zoomed));
      if (onDoubleClick) {
        this.rectSelection.on('dblclick.zoom', null);
      }
    } else {
      this.rectSelection.on('.zoom', null);
    }
  };

  zoomed = () => {
    const { ruler, zoomMode, onZoomXAxis } = this.props;
    if (ruler && ruler.visible) {
      this.processMouseMove(this.state.touchX, this.state.touchY);
    }
    const t = d3.event.transform;
    if (
      (zoomMode === ZoomMode.X || zoomMode === ZoomMode.BOTH) &&
      this.props.updateXTransformation
    ) {
      const newDomain = this.props.updateXTransformation(t, this.props.width);

      if (onZoomXAxis) {
        onZoomXAxis({ xSubDomain: newDomain, transformation: t });
      }
    }
    if (zoomMode === ZoomMode.Y || zoomMode === ZoomMode.BOTH) {
      const { series } = this.props;
      series.forEach(s => {
        this.props.updateYTransformation(s.id, t, this.props.height);
      });
    }
  };

  render() {
    const {
      width,
      height,
      crosshair,
      ruler,
      series,
      xSubDomain,
      xScalerFactory,
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
    const xScale = xScalerFactory(xSubDomain, width);
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
          const yScale = createYScale(s.ySubDomain, height);
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
          key={scaledArea.uuid || scaledArea.seriesId}
          color={color}
          {...scaledArea}
        />
      );
    });
    const areaBeingDefined = area ? (
      <Area key="user" {...area} color="#999" />
    ) : null;
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
        <rect
          ref={ref => {
            this.zoomNode = ref;
          }}
          width={width}
          height={height}
          pointerEvents="all"
          fill="none"
          onClick={this.onClick}
          onMouseMove={this.onMouseMove}
          onBlur={this.onMouseMove}
          onMouseOut={this.onMouseOut}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onDoubleClick={this.onDoubleClick}
        />
      </React.Fragment>
    );
  }
}

export default props => (
  <ScalerContext.Consumer>
    {({
      xSubDomain,
      xDomain,
      series,
      updateXTransformation,
      updateYTransformation,
      xScalerFactory,
    }) => (
      <InteractionLayer
        {...props}
        xSubDomain={xSubDomain}
        xDomain={xDomain}
        series={series}
        updateXTransformation={updateXTransformation}
        updateYTransformation={updateYTransformation}
        xScalerFactory={xScalerFactory}
      />
    )}
  </ScalerContext.Consumer>
);
