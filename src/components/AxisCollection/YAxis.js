import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { createYScale } from '../../utils/scale-helpers';
import GriffPropTypes, { singleSeriePropType } from '../../utils/proptypes';
import AxisPlacement from '../AxisPlacement';
import ScalerContext from '../../context/Scaler';

const propTypes = {
  zoomable: PropTypes.bool,
  offsetx: PropTypes.number.isRequired,
  series: singleSeriePropType,
  collection: GriffPropTypes.collection,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  yAxisPlacement: GriffPropTypes.axisPlacement,
  // Number => String
  tickFormatter: PropTypes.func.isRequired,
  defaultColor: PropTypes.string,

  // These are populated by Griff.
  updateDomains: GriffPropTypes.updateDomainsFunc.isRequired,
  subDomainsByItemId: GriffPropTypes.subDomainsByItemId.isRequired,
};

const defaultProps = {
  series: null,
  collection: null,
  zoomable: true,
  onMouseEnter: null,
  onMouseLeave: null,
  yAxisPlacement: AxisPlacement.RIGHT,
  defaultColor: '#000',
};

class YAxis extends Component {
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
    const {
      event: { sourceEvent, transform },
    } = d3;
    const { y: ySubDomain } =
      this.props.subDomainsByItemId[this.getItem().id] || {};
    const ySubDomainRange = ySubDomain[1] - ySubDomain[0];
    let newSubDomain = null;
    if (sourceEvent.deltaY) {
      // This is a zoom event.
      const { deltaMode, deltaY, offsetY } = sourceEvent;

      // This was borrowed from d3-zoom.
      const zoomFactor = (deltaY * (deltaMode ? 120 : 1)) / 500;

      // Invert the event coordinates for sanity, since they're measured from
      // the top-left, but we want to go from the bottom-left.
      const percentFromBottom = (height - offsetY) / height;

      // Figure out the value on the scale where the mouse is so that the new
      // subdomain does not shift.
      const valueAtMouse = ySubDomain[0] + ySubDomainRange * percentFromBottom;

      // How big the next subdomain is going to be
      const newSpan = ySubDomainRange * (1 + zoomFactor);

      // Finally, place this new span into the subdomain, centered about the
      // mouse, and correctly (proportionately) split above & below so that the
      // axis is stable.
      newSubDomain = [
        valueAtMouse - newSpan * percentFromBottom,
        valueAtMouse + newSpan * (1 - percentFromBottom),
      ];
    } else if (sourceEvent.movementY) {
      // This is a drag event.
      const percentMovement =
        ySubDomainRange * (sourceEvent.movementY / height);
      newSubDomain = ySubDomain.map(bound => bound + percentMovement);
    } else if (sourceEvent.type === 'touchmove') {
      // This is a drag event from touch.
      const percentMovement = ySubDomainRange * (transform.y / height);
      newSubDomain = ySubDomain.map(bound => bound + percentMovement);
    }
    if (newSubDomain) {
      this.props.updateDomains(
        {
          [this.getItem().id]: {
            y: newSubDomain,
          },
        },
        () => this.selection.property('__zoom', d3.zoomIdentity)
      );
    }
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
    const {
      defaultColor,
      subDomainsByItemId,
      height,
      tickFormatter,
    } = this.props;

    const item = this.getItem();
    const color = item.color || defaultColor;
    const scale = createYScale(subDomainsByItemId[item.id].y, height);
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
          stroke={color}
          d={this.getPathString({ tickSizeOuter, range, strokeWidth })}
        />
        {values.map(v => {
          const lineProps = {
            stroke: color,
            ...this.getLineProps({ tickSizeInner, strokeWidth }),
          };

          const textProps = {
            fill: color,
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

export default props => (
  <ScalerContext.Consumer>
    {({ subDomainsByItemId, updateDomains }) => (
      <YAxis
        {...props}
        subDomainsByItemId={subDomainsByItemId}
        updateDomains={updateDomains}
      />
    )}
  </ScalerContext.Consumer>
);
