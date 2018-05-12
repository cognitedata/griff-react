import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

const tickTransformer = {
  x: v => `translate(${v}, 0)`,
  y: v => `translate(0, ${v})`,
};

const formatMillisecond = d3.timeFormat('.%L');
const formatSecond = d3.timeFormat(':%S');
const formatMinute = d3.timeFormat('%H:%M');
const formatHour = d3.timeFormat('%H:00');
const formatDay = d3.timeFormat('%d/%m');
const formatWeek = d3.timeFormat('%d/%m');
const formatMonth = d3.timeFormat('%d/%m');
const formatYear = d3.timeFormat('%b %Y');

function getFormat(date) {
  if (d3.timeSecond(date) < date) {
    return formatMillisecond;
  }
  if (d3.timeMinute(date) < date) {
    return formatSecond;
  }
  if (d3.timeHour(date) < date) {
    return formatMinute;
  }
  if (d3.timeDay(date) < date) {
    return formatHour;
  }
  if (d3.timeMonth(date) < date) {
    if (d3.timeWeek(date) < date) {
      return formatDay;
    }
    return formatWeek;
  }
  if (d3.timeYear(date) < date) {
    return formatMonth;
  }
  return formatYear;
}

function multiFormat(date) {
  return getFormat(date)(date);
}

export default class Axis extends Component {
  static propTypes = {
    scale: PropTypes.func.isRequired,
    zoomable: PropTypes.bool,
    mode: PropTypes.oneOf(['x', 'y']).isRequired,
    id: PropTypes.string,
    updateYScale: PropTypes.func,
    offsetx: PropTypes.number.isRequired,
    offsety: PropTypes.number.isRequired,
    width: PropTypes.number,
    strokeColor: PropTypes.string,
  };
  static defaultProps = {
    zoomable: true,
    id: undefined,
    strokeColor: 'black',
    updateYScale: undefined,
    width: 0,
  };

  componentWillMount() {
    this.zoom = d3.zoom().on('zoom', this.didZoom);
  }

  componentDidMount() {
    this.selection = d3.select(this.zoomNode);
    this.syncZoomingState();
  }

  componentDidUpdate(prevProps) {
    if (!!prevProps.zoomable !== !!this.props.zoomable) {
      this.syncZoomingState();
    }
  }

  getTickFormat = scale => {
    if (this.props.mode === 'x') {
      return multiFormat;
    }
    return scale.tickFormat();
  };

  didZoom = () => {
    const t = d3.event.transform;
    this.props.updateYScale(t, this.props.id);
  };

  syncZoomingState = () => {
    if (this.props.mode === 'x') {
      return;
    }
    if (this.props.zoomable) {
      this.selection.call(this.zoom);
    } else {
      this.selection.on('.zoom', null);
    }
  };

  renderZoomRect() {
    if (this.props.mode === 'x') {
      return null;
    }
    const { offsetx, offsety, width } = this.props;
    return (
      <rect
        width={width}
        height={offsety}
        x={offsetx}
        fill="none"
        pointerEvents="all"
        ref={ref => {
          this.zoomNode = ref;
        }}
      />
    );
  }

  renderAxis() {
    const { scale, mode, offsetx, offsety, strokeColor } = this.props;
    const axis = mode === 'x' ? d3.axisBottom(scale) : d3.axisRight(scale);
    const tickFontSize = 14;
    const strokeWidth = 2;
    const halfStrokeWidth = strokeWidth / 2;
    const tickSizeOuter = axis.tickSizeOuter();
    const tickSizeInner = axis.tickSizeInner();
    const tickPadding = axis.tickPadding();
    const values = scale.ticks();
    const k = 1;
    const x = mode === 'x' ? 'x' : 'y';
    const y = mode === 'x' ? 'y' : 'x';
    const tickFormat = this.getTickFormat(scale);
    const range = scale.range().map(r => r + halfStrokeWidth);
    let pathString;
    if (mode === 'x') {
      pathString = `M${range[0]},${k * tickSizeOuter}V${halfStrokeWidth}H${
        range[1]
      }V${k * tickSizeOuter}`;
    } else {
      pathString = `M${k * tickSizeOuter},${range[0]}H${halfStrokeWidth}V${
        range[1]
      }H${k * tickSizeOuter}`;
    }
    return (
      <g
        className="axis"
        fill="none"
        fontSize={tickFontSize}
        textAnchor={mode === 'x' ? 'middle' : 'start'}
        strokeWidth={strokeWidth}
        transform={
          mode === 'x'
            ? `translate(${offsetx}, ${offsety})`
            : `translate(${offsetx}, 0)`
        }
      >
        <path stroke={strokeColor} d={pathString} />
        {values.map(v => {
          const lineProps = { stroke: strokeColor };
          lineProps[`${y}2`] = k * tickSizeInner;
          lineProps[`${x}1`] = halfStrokeWidth;
          lineProps[`${x}2`] = halfStrokeWidth;

          const textProps = {
            fill: strokeColor,
            dy: mode === 'x' ? '0.71em' : '0.32em',
          };
          textProps[y] = k * Math.max(tickSizeInner, 0) + tickPadding;
          textProps[x] = halfStrokeWidth;
          return (
            <g key={+v} opacity={1} transform={tickTransformer[mode](scale(v))}>
              <line {...lineProps} />
              <text {...textProps}>{tickFormat(v)}</text>
            </g>
          );
        })}
      </g>
    );
  }

  render() {
    return (
      <g className={`axis-${this.props.mode}`}>
        {this.renderAxis()}
        {this.renderZoomRect()}
      </g>
    );
  }
}
