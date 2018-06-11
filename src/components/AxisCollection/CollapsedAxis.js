import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';
import { createYScale } from '../../utils/scale-helpers';
import { singleSeriePropType } from '../../utils/proptypes';

export default class CollapsedAxis extends Component {
  static propTypes = {
    // TODO: Zooming is currently not supported.
    // It might be nice to support zooming all of the axes when you zoom on
    // the collapsed one. Experiment with this and either add it or remove
    // all of this unused code.
    zoomable: PropTypes.bool,
    series: PropTypes.arrayOf(singleSeriePropType),
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    offsetx: PropTypes.number,
    updateYTransformation: PropTypes.func,
    yTransformation: PropTypes.shape({
      y: PropTypes.number.isRequired,
      k: PropTypes.number.isRequired,
      rescaleY: PropTypes.func.isRequired,
    }),
    color: PropTypes.string,
  };

  static defaultProps = {
    series: [],
    zoomable: false,
    updateYTransformation: () => {},
    yTransformation: null,
    color: '#666',
    offsetx: 0,
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
    const { color, height } = this.props;
    const scale = createYScale([0, 100], height);
    const axis = d3.axisRight(scale);
    const tickFontSize = 14;
    const strokeWidth = 2;
    const halfStrokeWidth = strokeWidth / 2;
    const tickSizeOuter = axis.tickSizeOuter();
    const tickSizeInner = axis.tickSizeInner();
    // same as for xAxis but consider height of the screen ~two times smaller
    const values = scale.ticks(Math.floor(height / 50) || 1);
    const k = 2.5;
    const range = scale.range().map(r => r + halfStrokeWidth);
    const pathString = [
      `M${k * tickSizeOuter},${range[0]}`,
      `H${halfStrokeWidth}`,
      `V${range[1]}`,
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
        <path stroke={color} d={pathString} />
        {values.map(v => {
          const lineProps = { stroke: color };
          lineProps.x2 = k * tickSizeInner;
          lineProps.y1 = halfStrokeWidth;
          lineProps.y2 = halfStrokeWidth;
          return (
            <g key={+v} opacity={1} transform={`translate(0, ${scale(v)})`}>
              <line {...lineProps} />
            </g>
          );
        })}
      </g>
    );
  }

  render() {
    const { zoomable, offsetx } = this.props;
    return (
      <g className="axis-y" transform={`translate(${offsetx}, 0)`}>
        {this.renderAxis()}
        {zoomable && this.renderZoomRect()}
      </g>
    );
  }
}
