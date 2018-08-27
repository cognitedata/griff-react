import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { scalerFactoryFunc } from '../utils/proptypes';

const tickTransformer = v => `translate(${v}, 0)`;

const formatMillisecond = d3.timeFormat('.%L');
const formatSecond = d3.timeFormat(':%S');
const formatMinute = d3.timeFormat('%H:%M');
const formatHour = d3.timeFormat('%H:00');
const formatDay = d3.timeFormat('%d/%m');
const formatWeek = d3.timeFormat('%d/%m');
const formatMonth = d3.timeFormat('%d/%m');
const formatYear = d3.timeFormat('%b %Y');

function multiFormat(date) {
  /* eslint-disable no-nested-ternary */
  return (d3.timeSecond(date) < date
    ? formatMillisecond
    : d3.timeMinute(date) < date
      ? formatSecond
      : d3.timeHour(date) < date
        ? formatMinute
        : d3.timeDay(date) < date
          ? formatHour
          : d3.timeMonth(date) < date
            ? d3.timeWeek(date) < date
              ? formatDay
              : formatWeek
            : d3.timeYear(date) < date
              ? formatMonth
              : formatYear)(date);
}

const propTypes = {
  domain: PropTypes.arrayOf(PropTypes.number).isRequired,
  strokeColor: PropTypes.string,
  width: PropTypes.number.isRequired,
  height: PropTypes.number,
  xScalerFactory: scalerFactoryFunc.isRequired,
  // Number => String
  tickFormatter: PropTypes.func,
  ticks: PropTypes.number,
};

const defaultProps = {
  strokeColor: 'black',
  height: 50,
  tickFormatter: multiFormat,
  ticks: null,
};

class Axis extends Component {
  renderAxis() {
    const {
      domain,
      width,
      strokeColor,
      xScalerFactory,
      tickFormatter = multiFormat,
      ticks,
    } = this.props;
    const scale = xScalerFactory(domain, width);
    const axis = d3.axisBottom(scale);
    const tickFontSize = 14;
    const strokeWidth = 2;
    const halfStrokeWidth = strokeWidth / 2;
    const tickSizeOuter = axis.tickSizeOuter();
    const tickSizeInner = axis.tickSizeInner();
    const tickPadding = axis.tickPadding();
    // In order to reduce label overlapping for smaller devices
    // we want to adjust amount of ticks depending on width.
    // Default amount of ticks is 10 which is sutable for a
    // regular 1280 display. So by dividing width by ~100
    // we can achieve appropriate amount of ticks for any width.
    const values = scale.ticks(ticks || Math.floor(width / 100) || 1);
    const k = 1;
    const range = scale.range().map(r => r + halfStrokeWidth);
    const pathString = [
      `M${range[0]},${k * tickSizeOuter}`,
      `V${halfStrokeWidth}`,
      `H${range[1] - strokeWidth}`,
      `V${k * tickSizeOuter}`,
    ].join('');
    return (
      <g
        className="x-axis"
        fill="none"
        fontSize={tickFontSize}
        textAnchor="middle"
        strokeWidth={strokeWidth}
      >
        <path stroke={strokeColor} d={pathString} />
        {values.map(v => {
          const lineProps = { stroke: strokeColor };
          lineProps.y2 = k * tickSizeInner;
          lineProps.x1 = halfStrokeWidth;
          lineProps.x2 = halfStrokeWidth;

          const textProps = {
            fill: strokeColor,
            dy: '0.71em',
          };
          textProps.y = k * Math.max(tickSizeInner, 0) + tickPadding;
          textProps.x = halfStrokeWidth;
          return (
            <g key={+v} opacity={1} transform={tickTransformer(scale(v))}>
              <line {...lineProps} />
              <text {...textProps}>{tickFormatter(v)}</text>
            </g>
          );
        })}
      </g>
    );
  }

  render() {
    const { width, height } = this.props;
    return (
      <svg width={width} height={height}>
        {this.renderAxis()}
      </svg>
    );
  }
}

Axis.propTypes = propTypes;
Axis.defaultProps = defaultProps;

export default Axis;
