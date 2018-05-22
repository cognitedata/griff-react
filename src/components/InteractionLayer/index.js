import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import isEqual from 'lodash.isequal';
import ScalerContext from '../../context/Scaler';
import { createXScale, createYScale } from '../../utils/scale-helpers';
import { seriesPropType, annotationPropType } from '../../utils/proptypes';
import Annotation from '../Annotation';

class InteractionLayer extends React.Component {
  static propTypes = {
    crosshair: PropTypes.bool,
    height: PropTypes.number.isRequired,
    onClick: PropTypes.func,
    onClickAnnotation: PropTypes.func,
    onMouseMove: PropTypes.func,
    onMouseOut: PropTypes.func,
    updateXTransformation: PropTypes.func,
    series: seriesPropType,
    annotations: PropTypes.arrayOf(PropTypes.shape(annotationPropType)),
    width: PropTypes.number.isRequired,
    subDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    baseDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    zoomable: PropTypes.bool,
  };

  static defaultProps = {
    annotations: [],
    crosshair: false,
    onClick: null,
    onClickAnnotation: null,
    onMouseMove: null,
    onMouseOut: null,
    updateXTransformation: () => {},
    series: [],
    zoomable: true,
  };

  state = {
    crosshair: {
      x: null,
      y: null,
    },
  };

  componentDidMount() {
    const { width, height } = this.props;
    this.zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]]);
    this.rectSelection = d3.select(this.zoomNode);
    this.syncZoomingState();
  }

  componentDidUpdate(prevProps) {
    // This is only updating internals -- but could still slow down performance.
    // Look into this.
    if (this.props.zoomable !== prevProps.zoomable) {
      this.syncZoomingState();
    }
    const { subDomain: p } = prevProps;
    const { subDomain: c } = this.props;
    if (this.rectSelection.property('__zoom')) {
      // Checking if the existing selection has a current zoom state.
      const { width, subDomain, baseDomain } = this.props;
      if (!isEqual(p, c) || width !== prevProps.width) {
        const scale = createXScale(baseDomain, width);
        const selection = subDomain.map(scale);
        const transform = d3.zoomIdentity
          .scale(width / (selection[1] - selection[0]))
          .translate(-selection[0], 0);
        const prev = this.rectSelection.property('__zoom');
        // Checking if the difference in x transform is significant
        // This means that something else has zoomed (brush) and we need to update the internals
        if (
          Math.abs(prev.k - transform.k) > 0.5 ||
          Math.abs(prev.x - transform.x) > 50
        ) {
          this.rectSelection.property('__zoom', transform);
        }
      }
    }
  }

  onMouseMove = e => {
    const {
      series,
      height,
      width,
      subDomain,
      onMouseMove,
      crosshair,
    } = this.props;
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
    if (onMouseMove) {
      const xScale = createXScale(subDomain, width);
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
            rawTimestamp - xAccessor(x0) > xAccessor(x1) - rawTimestamp
              ? x1
              : x0;
        }
        if (d) {
          const yScale = createYScale(yDomain, height);
          const ts = xAccessor(d);
          const value = yAccessor(d);
          output.points.push({
            id: s.id,
            timestamp: ts,
            value,
            x: xScale(ts),
            y: yScale(value),
          });
        } else {
          output.points.push({ id: s.id });
        }
      });

      onMouseMove(output);
    }
  };

  onMouseOut = e => {
    const { onMouseMove, crosshair, onMouseOut } = this.props;
    if (crosshair) {
      this.setState({
        crosshair: {
          x: null,
          y: null,
        },
      });
    }
    if (onMouseMove) {
      onMouseMove([]);
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
    } = this.props;
    if (onClickAnnotation) {
      const xScale = createXScale(subDomain, width);
      const xpos = e.nativeEvent.offsetX;
      const ypos = e.nativeEvent.offsetY;
      const rawTimestamp = xScale.invert(xpos).getTime();
      annotations.forEach(a => {
        if (rawTimestamp > a.data[0] && rawTimestamp < a.data[1]) {
          // Clicked within an annotation
          onClickAnnotation(a, xpos, ypos);
        }
      });
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

  zoomed = () => {
    const t = d3.event.transform;
    this.props.updateXTransformation(t, this.props.width);
  };

  render() {
    const { width, height, crosshair, subDomain } = this.props;
    const {
      crosshair: { x, y },
    } = this.state;
    const xScale = createXScale(subDomain, width);
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
    {({ subDomain, baseDomain, series, updateXTransformation }) => (
      <InteractionLayer
        {...props}
        subDomain={subDomain}
        baseDomain={baseDomain}
        series={series}
        updateXTransformation={updateXTransformation}
      />
    )}
  </ScalerContext.Consumer>
);
