import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';
import { createYScale } from '../../utils/scale-helpers';
import GriffPropTypes, { singleSeriePropType } from '../../utils/proptypes';
import AxisPlacement from '../AxisPlacement';

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
  yAxisPlacement: GriffPropTypes.axisPlacement,
  // Number => String
  tickFormatter: PropTypes.func.isRequired,
};

const defaultProps = {
  series: null,
  collection: null,
  zoomable: true,
  updateYTransformation: () => {},
  yTransformation: null,
  onMouseEnter: null,
  onMouseLeave: null,
  yAxisPlacement: AxisPlacement.RIGHT,
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
        (!!prevProps.series !== !!this.props.series &&
          !isEqual(
            (prevProps.series || {}).ySubDomain,
            (this.props.series || {}).ySubDomain
          )) ||
        (!!prevProps.collection !== !!this.props.collection &&
          !isEqual(
            (prevProps.collection || {}).ySubDomain,
            (this.props.collection || {}).ySubDomain
          ))
      ) {
        this.selection.property('__zoom', this.props.yTransformation);
      }
    }
  }

  getItem = () =>
    this.props.series ? this.props.series : this.props.collection;

  getLineProps = ({ tickSizeInner, strokeWidth }) => {
    const { width, yAxisPlacement } = this.props;
    switch (yAxisPlacement) {
      case AxisPlacement.LEFT:
        return {
          x1: width - strokeWidth,
          x2: width - strokeWidth - tickSizeInner,
          y1: strokeWidth / 2,
          y2: strokeWidth / 2,
        };
      case AxisPlacement.BOTH:
        throw new Error(
          'BOTH is not a valid option for YAxis -- please specify RIGHT or LEFT'
        );
      case AxisPlacement.RIGHT:
      case AxisPlacement.UNSPECIFIED:
      default:
        return {
          x1: 0,
          x2: tickSizeInner,
          y1: strokeWidth / 2,
          y2: strokeWidth / 2,
        };
    }
  };

  getPathString = ({ tickSizeOuter, range, strokeWidth }) => {
    const { yAxisPlacement, width } = this.props;
    switch (yAxisPlacement) {
      case AxisPlacement.LEFT:
        return [
          `M${width - tickSizeOuter},${range[0] - strokeWidth}`,
          `H${width - strokeWidth}`,
          `V${range[1]}`,
          `H${width - tickSizeOuter}`,
        ].join('');
      case AxisPlacement.BOTH:
        throw new Error(
          'BOTH is not a valid option for YAxis -- please specify RIGHT or LEFT'
        );
      case AxisPlacement.RIGHT:
      case AxisPlacement.UNSPECIFIED:
      default:
        return [
          // Move to this (x,y); start drawing
          `M${tickSizeOuter},${range[0] - strokeWidth}`,
          // Draw a horizontal line half strokeWidth long
          `H${strokeWidth / 2}`,
          // Draw a vertical line from bottom to top
          `V${range[1]}`,
          // Finish with another horizontal line
          `H${tickSizeOuter}`,
        ].join('');
    }
  };

  getTextAnchor = () => {
    const { yAxisPlacement } = this.props;
    switch (yAxisPlacement) {
      case AxisPlacement.LEFT:
        return 'end';
      case AxisPlacement.BOTH:
        throw new Error(
          'BOTH is not a valid option for YAxis -- please specify RIGHT or LEFT'
        );
      case AxisPlacement.RIGHT:
      case AxisPlacement.UNSPECIFIED:
      default:
        return 'start';
    }
  };

  getTextProps = ({ tickSizeInner, tickPadding, strokeWidth }) => {
    const { width, yAxisPlacement } = this.props;
    switch (yAxisPlacement) {
      case AxisPlacement.LEFT:
        return {
          x: Math.max(width - tickSizeInner, 0) - tickPadding,
          y: strokeWidth / 2,
        };
      case AxisPlacement.BOTH:
        throw new Error(
          'BOTH is not a valid option for YAxis -- please specify RIGHT or LEFT'
        );
      case AxisPlacement.RIGHT:
      case AxisPlacement.UNSPECIFIED:
      default:
        return {
          x: Math.max(tickSizeInner, 0) + tickPadding,
          y: strokeWidth / 2,
        };
    }
  };

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
    const { height, tickFormatter } = this.props;

    const item = this.getItem();
    const scale = createYScale(item.ySubDomain, height);
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
    const range = scale.range().map(r => r + halfStrokeWidth);
    return (
      <g
        className="axis y-axis"
        fill="none"
        fontSize={tickFontSize}
        textAnchor={this.getTextAnchor()}
        strokeWidth={strokeWidth}
      >
        <path
          stroke={item.color}
          d={this.getPathString({ tickSizeOuter, range, strokeWidth })}
        />
        {values.map(v => {
          const lineProps = {
            stroke: item.color,
            ...this.getLineProps({ tickSizeInner, strokeWidth }),
          };

          const textProps = {
            fill: item.color,
            dy: '0.32em',
            ...this.getTextProps({ tickSizeInner, tickPadding, strokeWidth }),
          };
          return (
            <g key={+v} opacity={1} transform={`translate(0, ${scale(v)})`}>
              <line {...lineProps} />
              <text className="tick-value" {...textProps}>
                {tickFormatter(v)}
              </text>
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
