import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';
import { createYScale } from '../../utils/scale-helpers';
import GriffPropTypes, { singleSeriePropType } from '../../utils/proptypes';

const propTypes = {
  zoomable: PropTypes.bool,
  offsetx: PropTypes.number.isRequired,
  series: singleSeriePropType,
  collection: GriffPropTypes.collection,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  updateYTransformation: PropTypes.func,
  yTransformation: PropTypes.shape({
    y: PropTypes.number.isRequired,
    k: PropTypes.number.isRequired,
    rescaleY: PropTypes.func.isRequired,
  }),
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
};

const defaultProps = {
  series: {},
  collection: {},
  zoomable: true,
  updateYTransformation: () => {},
  yTransformation: null,
  onMouseEnter: null,
  onMouseLeave: null,
};

export default class YAxis extends Component {
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
      if (
        !isEqual(prevProps.series.yDomain, this.props.series.yDomain) ||
        !isEqual(prevProps.collection.yDomain, this.props.collection.yDomain)
      ) {
        this.selection.property('__zoom', this.props.yTransformation);
      }
    }
  }

  getItem = () =>
    this.props.series.id ? this.props.series : this.props.collection;

  syncZoomingState = () => {
    if (this.props.zoomable) {
      this.selection.call(this.zoom);
    } else {
      this.selection.on('.zoom', null);
    }
  };

  didZoom = () => {
    const { height } = this.props;
    const t = d3.event.transform;
    this.props.updateYTransformation(this.getItem().id, t, height);
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
    const { height } = this.props;

    const scale = createYScale(this.getItem().yDomain, height);
    const axis = d3.axisRight(scale);
    const tickFontSize = 14;
    const strokeWidth = 2;
    const halfStrokeWidth = strokeWidth / 2;
    const tickSizeOuter = axis.tickSizeOuter();
    const tickSizeInner = axis.tickSizeInner();
    const tickPadding = axis.tickPadding();
    // same as for xAxis but consider height of the screen ~two times smaller
    const nTicks = Math.floor(height / 50) || 1;
    const values = scale.ticks(nTicks);
    const k = 1;
    const tickFormat = scale.tickFormat(nTicks);
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
        <path stroke={this.getItem().color} d={pathString} />
        {values.map(v => {
          const lineProps = { stroke: this.getItem().color };
          lineProps.x2 = k * tickSizeInner;
          lineProps.y1 = halfStrokeWidth;
          lineProps.y2 = halfStrokeWidth;

          const textProps = { fill: this.getItem().color, dy: '0.32em' };
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
    const { offsetx, zoomable, onMouseEnter, onMouseLeave } = this.props;
    const cursor = zoomable ? 'move' : 'inherit';
    return (
      <g
        className="axis-y"
        transform={`translate(${offsetx}, 0)`}
        cursor={cursor}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {this.renderAxis()}
        {this.renderZoomRect()}
      </g>
    );
  }
}

YAxis.propTypes = propTypes;
YAxis.defaultProps = defaultProps;
