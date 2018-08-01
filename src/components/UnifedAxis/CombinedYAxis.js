import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { createYScale } from '../../utils/scale-helpers';
import { seriesPropType } from '../../utils/proptypes';

const propTypes = {
  series: seriesPropType.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  color: PropTypes.string,
  // Number => String
  tickFormatter: PropTypes.func,
};

const defaultProps = {
  color: '#000',
  tickFormatter: Number,
};

export default class CombinedYAxis extends Component {
  getDomain = seriesArray => {
    const yDomain = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
    seriesArray.forEach(s => {
      yDomain[0] = Math.min(yDomain[0], s.yDomain[0]);
      yDomain[1] = Math.max(yDomain[1], s.yDomain[1]);
    });
    return yDomain;
  };

  renderAxis() {
    const { series, height, color, tickFormatter } = this.props;
    const scale = createYScale(this.getDomain(series), height);
    const axis = d3.axisRight(scale);
    const tickFontSize = 14;
    const strokeWidth = 2;
    const halfStrokeWidth = strokeWidth / 2;
    const tickSizeOuter = axis.tickSizeOuter();
    const tickSizeInner = axis.tickSizeInner();
    const tickPadding = axis.tickPadding();
    // same as for xAxis but consider height of the screen ~two times smaller
    const values = scale.ticks(Math.floor(height / 50) || 1);
    const k = 1;
    const range = scale.range().map(r => r + halfStrokeWidth);
    const pathString = [
      // Move to this (x,y); start drawing
      `M${k * tickSizeOuter},${range[0] - strokeWidth}`,
      // Draw a horizontal line halfStrokeWidth long
      `H${halfStrokeWidth}`,
      // Draw a vertical line from bottom to top
      `V${range[1]}`,
      // Finish with another horizontal line
      `H${k * tickSizeOuter}`,
    ].join('');
    return (
      <g
        className="axis"
        fill="none"
        fontSize={tickFontSize}
        textAnchor="start"
        strokeWidth={strokeWidth}
      >
        <path stroke={series.color || color} d={pathString} />
        {values.map(v => {
          const lineProps = { stroke: series.color || color };
          lineProps.x2 = k * tickSizeInner;
          lineProps.y1 = halfStrokeWidth;
          lineProps.y2 = halfStrokeWidth;

          const textProps = { fill: series.color || color, dy: '0.32em' };
          textProps.x = k * Math.max(tickSizeInner, 0) + tickPadding;
          textProps.y = halfStrokeWidth;
          return (
            <g key={+v} opacity={1} transform={`translate(0, ${scale(v)})`}>
              <line {...lineProps} />
              <text {...textProps}>{tickFormatter(v)}</text>
            </g>
          );
        })}
      </g>
    );
  }

  render() {
    return <g className="axis-y">{this.renderAxis()}</g>;
  }
}

CombinedYAxis.propTypes = propTypes;
CombinedYAxis.defaultProps = defaultProps;
