import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { createXScale } from '../utils/scale-helpers';
import GriffPropTypes from '../utils/proptypes';
import AxisPlacement from './LineChart/AxisPlacement';

const propTypes = {
  domain: PropTypes.arrayOf(PropTypes.number).isRequired,
  strokeColor: PropTypes.string,
  width: PropTypes.number.isRequired,
  height: PropTypes.number,
  xAxisPlacement: GriffPropTypes.axisPlacement,
};

const defaultProps = {
  strokeColor: 'black',
  height: 50,
  xAxisPlacement: AxisPlacement.BOTTOM,
};

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

class Axis extends Component {
  getLineProps = ({ tickSizeInner, strokeWidth }) => {
    const { height, xAxisPlacement } = this.props;
    switch (xAxisPlacement) {
      case AxisPlacement.TOP:
        return {
          x1: strokeWidth / 2,
          x2: strokeWidth / 2,
          y1: height - tickSizeInner,
          y2: height,
        };
      case AxisPlacement.BOTTOM:
      case AxisPlacement.UNSPECIFIED:
      default:
        return {
          x1: strokeWidth / 2,
          x2: strokeWidth / 2,
          y2: tickSizeInner,
        };
    }
  };

  getPathString = ({ range, strokeWidth, tickSizeOuter }) => {
    const { height, xAxisPlacement } = this.props;
    switch (xAxisPlacement) {
      case AxisPlacement.TOP:
        return [
          `M${range[0]},${height - tickSizeOuter}`,
          `V${height - strokeWidth / 2}`,
          `H${range[1] - strokeWidth}`,
          `V${height - tickSizeOuter}`,
        ].join('');
      case AxisPlacement.BOTTOM:
      case AxisPlacement.UNSPECIFIED:
      default:
        return [
          `M${range[0]},${tickSizeOuter}`,
          `V${strokeWidth / 2}`,
          `H${range[1] - strokeWidth}`,
          `V${tickSizeOuter}`,
        ].join('');
    }
  };

  getTextProps = ({ tickSizeInner, tickPadding, strokeWidth }) => {
    const { height, xAxisPlacement } = this.props;
    switch (xAxisPlacement) {
      case AxisPlacement.TOP:
        return {
          y: height - (Math.max(tickSizeInner, 0) + tickPadding) - 10,
          x: strokeWidth / 2,
        };
      case AxisPlacement.BOTTOM:
      case AxisPlacement.UNSPECIFIED:
      default:
        return {
          y: Math.max(tickSizeInner, 0) + tickPadding,
          x: strokeWidth / 2,
        };
    }
  };

  renderAxis() {
    const { domain, width, strokeColor } = this.props;
    const scale = createXScale(domain, width);
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
    const values = scale.ticks(Math.floor(width / 100) || 1);
    const tickFormat = multiFormat;
    const range = scale.range().map(r => r + halfStrokeWidth);
    const pathString = this.getPathString({
      range,
      strokeWidth,
      tickSizeOuter,
    });
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
          const lineProps = {
            stroke: strokeColor,
            ...this.getLineProps({ strokeWidth, tickSizeInner }),
          };

          const textProps = {
            fill: strokeColor,
            dy: '0.71em',
            ...this.getTextProps({ strokeWidth, tickPadding, tickSizeInner }),
          };
          return (
            <g key={+v} opacity={1} transform={tickTransformer(scale(v))}>
              <line stroke={strokeColor} {...lineProps} />
              <text {...textProps}>{tickFormat(v)}</text>
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
