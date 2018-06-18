import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import isEqual from 'lodash.isequal';
import ScalerContext from '../../context/Scaler';
import { createYScale } from '../../utils/scale-helpers';
import {
  seriesPropType,
  annotationPropType,
  rulerPropType,
} from '../../utils/proptypes';
import Annotation from '../Annotation';
import Ruler from '../Ruler';

class InteractionLayer extends React.Component {
  static propTypes = {
    crosshair: PropTypes.bool,
    ruler: rulerPropType,
    height: PropTypes.number.isRequired,
    onClick: PropTypes.func,
    onClickAnnotation: PropTypes.func,
    onMouseMove: PropTypes.func,
    onMouseOut: PropTypes.func,
    updateXTransformation: PropTypes.func,
    updateYTransformation: PropTypes.func,
    series: seriesPropType,
    annotations: PropTypes.arrayOf(annotationPropType),
    width: PropTypes.number.isRequired,
    subDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    baseDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    zoomable: PropTypes.bool,
    // (domain, width) => [number, number]
    xScalerFactory: PropTypes.func.isRequired,
  };

  static defaultProps = {
    annotations: [],
    crosshair: false,
    onClick: null,
    onClickAnnotation: null,
    onMouseMove: null,
    onMouseOut: null,
    updateXTransformation: () => {},
    updateYTransformation: () => {},
    series: [],
    zoomable: true,
    ruler: {
      visible: false,
      xLabel: () => {},
      yLabel: () => {},
    },
  };

  state = {
    crosshair: {
      x: null,
      y: null,
    },
    points: [],
    touchX: null,
    touchY: null,
  };

  componentDidMount() {
    const { width, height, xScalerFactory } = this.props;
    this.zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]]);
    this.rectSelection = d3.select(this.zoomNode);
    this.syncZoomingState();

    if (this.rectSelection.property('__zoom')) {
      const { subDomain, baseDomain } = this.props;
      // if subDomain differs from baseDomain on componentDidMount step that
      // means it has been specified by a user and we need to update internals
      if (!isEqual(subDomain, baseDomain)) {
        const scale = xScalerFactory(baseDomain, width);
        const selection = subDomain.map(scale);
        const transform = d3.zoomIdentity
          .scale(width / (selection[1] - selection[0]))
          .translate(-selection[0], 0);
        this.rectSelection.property('__zoom', transform);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { subDomain: prevSuDomain, ruler, xScalerFactory } = this.props;
    const { subDomain: curSubDomain, width } = nextProps;
    const { touchX, touchY } = this.state;
    if (ruler && touchX !== null && !isEqual(prevSuDomain, curSubDomain)) {
      // keep track on ruler on subdomain update
      const prevXScale = xScalerFactory(prevSuDomain, width);
      const curXScale = xScalerFactory(curSubDomain, width);
      const ts = prevXScale.invert(touchX).getTime();
      const newXPos = curXScale(ts);
      // hide ruler if point went out to the left of subdomain
      if (newXPos < 0) {
        this.setState({
          points: [],
          touchX: null,
          touchY: null,
        });
      } else {
        this.setState({
          touchX: newXPos,
        });
        this.processMouseMove(newXPos, touchY);
      }
    }
  }

  componentDidUpdate(prevProps) {
    // This is only updating internals -- but could still slow down performance.
    // Look into this.
    if (this.props.zoomable !== prevProps.zoomable) {
      this.syncZoomingState();
    }
    const { subDomain: p, baseDomain: prevBaseDomain } = prevProps;
    const { subDomain: c, baseDomain: curBaseDomain } = this.props;
    if (this.rectSelection.property('__zoom')) {
      // Checking if the existing selection has a current zoom state.
      const { width, subDomain, baseDomain, xScalerFactory } = this.props;
      const newBaseDomain = !isEqual(prevBaseDomain, curBaseDomain);
      if (!isEqual(p, c) || width !== prevProps.width || newBaseDomain) {
        const scale = xScalerFactory(baseDomain, width);
        const selection = subDomain.map(scale);
        const transform = d3.zoomIdentity
          .scale(width / (selection[1] - selection[0]))
          .translate(-selection[0], 0);
        const prev = this.rectSelection.property('__zoom');
        // Checking if the difference in x transform is significant
        // This means that something else has zoomed (brush) and we need to update the internals
        // TODO: This should be optimized
        if (
          Math.abs(prev.k - transform.k) > 0.5 ||
          Math.abs(prev.x - transform.x) > 50 ||
          newBaseDomain
        ) {
          this.rectSelection.property('__zoom', transform);
        }
      }
    }
  }

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
    if (onMouseMove || ruler) {
      this.processMouseMove(xpos, ypos);
      this.setState({
        touchX: xpos,
        touchY: ypos,
      });
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
    if (ruler) {
      this.setState({ points: [] });
    }
    if (onMouseMove) {
      onMouseMove({ points: [] });
    }
    if (onMouseOut) {
      onMouseOut(e);
    }
  };

  onClick = e => {
    const {
      onClickAnnotation,
      onClick,
      subDomain,
      width,
      annotations,
      xScalerFactory,
    } = this.props;
    if (onClickAnnotation) {
      const xScale = xScalerFactory(subDomain, width);
      const xpos = e.nativeEvent.offsetX;
      const ypos = e.nativeEvent.offsetY;
      const rawTimestamp = xScale.invert(xpos).getTime();
      let notified = false;
      annotations.forEach(a => {
        if (rawTimestamp > a.data[0] && rawTimestamp < a.data[1]) {
          // Clicked within an annotation
          onClickAnnotation(a, xpos, ypos);
          notified = true;
        }
      });
      if (notified) {
        return;
      }
    }
    if (onClick) {
      onClick(e);
    }
  };

  syncZoomingState = () => {
    if (this.props.zoomable) {
      this.rectSelection.call(this.zoom.on('zoom', this.zoomed));
    } else {
      this.rectSelection.on('.zoom', null);
    }
  };

  processMouseMove = (xpos, ypos) => {
    const {
      series,
      height,
      width,
      subDomain,
      onMouseMove,
      ruler,
      xScalerFactory,
    } = this.props;
    const xScale = xScalerFactory(subDomain, width);
    const inverted = xScale.invert(xpos);
    const rawTimestamp = inverted.getTime ? inverted.getTime() : inverted;
    const newPoints = [];
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
        const yScale = createYScale(yDomain, height);
        const ts = xAccessor(d);
        const value = yAccessor(d);
        newPoints.push({
          id: s.id,
          name: s.name,
          color: s.color,
          timestamp: ts,
          value,
          x: xScale(ts),
          y: yScale(value),
        });
      } else {
        newPoints.push({ id: s.id });
      }
    });

    if (ruler) {
      this.setState({ points: newPoints });
    }

    if (onMouseMove) {
      onMouseMove({ points: newPoints, xpos, ypos });
    }
  };

  zoomed = () => {
    if (this.props.ruler) {
      this.processMouseMove(this.state.touchX, this.state.touchY);
    }
    const t = d3.event.transform;
    if (this.props.updateYTransformation) {
      const { series } = this.props;
      series.forEach(s => {
        this.props.updateYTransformation(s.id, t, this.props.height);
      });
    }
    if (this.props.updateXTransformation) {
      this.props.updateXTransformation(t, this.props.width);
    }
  };

  render() {
    const {
      width,
      height,
      crosshair,
      ruler,
      subDomain,
      xScalerFactory,
    } = this.props;
    const {
      crosshair: { x, y },
      points,
    } = this.state;
    const xScale = xScalerFactory(subDomain, width);
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
    const annotations = this.props.annotations.map(a => (
      <Annotation key={a.id} {...a} xScale={xScale} height={height} />
    ));
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
        />
      </React.Fragment>
    );
  }
}

export default props => (
  <ScalerContext.Consumer>
    {({
      subDomain,
      baseDomain,
      series,
      updateXTransformation,
      updateYTransformation,
      xScalerFactory,
    }) => (
      <InteractionLayer
        {...props}
        subDomain={subDomain}
        baseDomain={baseDomain}
        series={series}
        updateXTransformation={updateXTransformation}
        updateYTransformation={updateYTransformation}
        xScalerFactory={xScalerFactory}
      />
    )}
  </ScalerContext.Consumer>
);
