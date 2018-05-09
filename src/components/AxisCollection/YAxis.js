import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

export default class YAxis extends Component {
  static defaultProps = {
    zoomable: true,
    height: PropTypes.number.isRequired,
  };

  componentWillMount() {
    this.zoom = d3.zoom().on('zoom', this.didZoom);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.zoomable != this.props.zoomable) {
      this.syncZoomingState();
    }
  }

  componentDidMount() {
    this.selection = d3.select(this.zoomNode);
    this.syncZoomingState();
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
    this.props.updateYScale(t, this.props.series.id);
  };

  renderZoomRect() {
    const { height, series } = this.props;
    return (
      <rect
        width={series.width}
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
    const { series } = this.props;
    const { height, strokeColor = 'black' } = this.props;
    const scale = series.scale([height, 0]);
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
        <path stroke={strokeColor} d={pathString} />
        {values.map(v => {
          const lineProps = { stroke: strokeColor };
          lineProps[`x2`] = k * tickSizeInner;
          lineProps[`y1`] = halfStrokeWidth;
          lineProps[`y2`] = halfStrokeWidth;

          const textProps = {
            fill: strokeColor,
            dy: '0.32em',
          };
          textProps['x'] = k * Math.max(tickSizeInner, 0) + tickPadding;
          textProps['y'] = halfStrokeWidth;
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
    const { offsetx } = this.props;
    return (
      <g className={`axis-y`} transform={`translate(${offsetx}, 0)`}>
        {this.renderAxis()}
        {this.renderZoomRect()}
      </g>
    );
  }
}
