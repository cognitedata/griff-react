import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';
import { createYScale } from '../../utils/scale-helpers';
import { singleSeriePropType } from '../../utils/proptypes';

export default class YAxis extends Component {
  static propTypes = {
    zoomable: PropTypes.bool,
    offsetx: PropTypes.number.isRequired,
    series: singleSeriePropType.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    updateYTransformation: PropTypes.func,
    yTransformation: PropTypes.shape({
      y: PropTypes.number.isRequired,
      k: PropTypes.number.isRequired,
      rescaleY: PropTypes.func.isRequired,
    }),
  };

  static defaultProps = {
    zoomable: true,
    updateYTransformation: () => {},
    yTransformation: null,
  };

  componentWillMount() {
    this.zoom = d3.zoom().on('zoom', this.didZoom);
  }

  componentDidMount() {
    this.selection = d3.select(this.zoomNode);
    this.syncZoomingState();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.zoomable !== this.props.zoomable) {
      this.syncZoomingState();
    }
    if (this.props.yTransformation) {
      if (!isEqual(prevProps.series.yDomain, this.props.series.yDomain)) {
        this.selection.property('__zoom', this.props.yTransformation);
      }
    }
  }

  syncZoomingState = () => {
    if (this.props.zoomable) {
      this.selection.call(this.zoom);
    } else {
      this.selection.on('.zoom', null);
    }
  };

  didZoom = () => {
    const t = d3.event.transform;
    this.props.updateYTransformation(
      this.props.series.id,
      t,
      this.props.height
    );
  };

  renderZoomRect() {
    const { height, width } = this.props;
    return (
      <rect
        width={width}
        height={height}
        fill="none"
        pointerEvents="all"
        ref={ref => {
          this.zoomNode = ref;
        }}
      />
    );
  }

  renderAxis() {
    const { series, height } = this.props;
    const scale = createYScale(series.yDomain, height);
    const axis = d3.axisRight(scale);
    const tickFontSize = 14;
    const strokeWidth = 2;
    const halfStrokeWidth = strokeWidth / 2;
    const tickSizeOuter = axis.tickSizeOuter();
    const tickSizeInner = axis.tickSizeInner();
    const tickPadding = axis.tickPadding();
    const values = scale.ticks();
    const k = 1;
    const tickFormat = scale.tickFormat();
    const range = scale.range().map(r => r + halfStrokeWidth);
    const pathString = `M${k * tickSizeOuter},${range[0]}H${halfStrokeWidth}V${
      range[1]
    }H${k * tickSizeOuter}`;
    return (
      <g
        className="axis"
        fill="none"
        fontSize={tickFontSize}
        textAnchor="start"
        strokeWidth={strokeWidth}
      >
        <path stroke={series.color} d={pathString} />
        {values.map(v => {
          const lineProps = { stroke: series.color };
          lineProps.x2 = k * tickSizeInner;
          lineProps.y1 = halfStrokeWidth;
          lineProps.y2 = halfStrokeWidth;

          const textProps = { fill: series.color, dy: '0.32em' };
          textProps.x = k * Math.max(tickSizeInner, 0) + tickPadding;
          textProps.y = halfStrokeWidth;
          return (
            <g key={+v} opacity={1} transform={`translate(0, ${scale(v)})`}>
              <line {...lineProps} />
              <text {...textProps}>{tickFormat(v)}</text>
            </g>
          );
        })}
      </g>
    );
  }

  render() {
    const { offsetx, zoomable } = this.props;
    const cursor = zoomable ? 'move' : 'inherit';
    return (
      <g
        className="axis-y"
        transform={`translate(${offsetx}, 0)`}
        cursor={cursor}
      >
        {this.renderAxis()}
        {this.renderZoomRect()}
      </g>
    );
  }
}
