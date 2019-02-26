import React from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { createYScale } from '../../utils/scale-helpers';
import GriffPropTypes, { singleSeriePropType } from '../../utils/proptypes';
import AxisPlacement from '../AxisPlacement';
import ScalerContext from '../../context/Scaler';
import ZoomRect from '../ZoomRect';
import Axes from '../../utils/Axes';

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
  // (number, values) => String
  tickFormatter: PropTypes.func.isRequired,
  defaultColor: PropTypes.string,
  ticks: PropTypes.number,

  // These are populated by Griff.
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
  ticks: 0,
};

const getItem = (series, collection) => series || collection;

const getLineProps = ({
  strokeWidth,
  tickSizeInner,
  width,
  yAxisPlacement,
}) => {
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

const getTextProps = ({
  strokeWidth,
  tickPadding,
  tickSizeInner,
  width,
  yAxisPlacement,
}) => {
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

const getPathString = ({
  range,
  strokeWidth,
  tickSizeOuter,
  width,
  yAxisPlacement,
}) => {
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

const getTextAnchor = ({ yAxisPlacement }) => {
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

const YAxis = ({
  collection,
  defaultColor,
  height,
  offsetx,
  onMouseEnter,
  onMouseLeave,
  series,
  subDomainsByItemId,
  tickFormatter,
  ticks,
  width,
  yAxisPlacement,
  zoomable,
}) => {
  const item = getItem(series, collection);
  const color = item.color || defaultColor;
  const scale = createYScale(Axes.y(subDomainsByItemId[item.id]), height);
  const axis = d3.axisRight(scale);
  const tickFontSize = 14;
  const strokeWidth = 2;
  const halfStrokeWidth = strokeWidth / 2;
  const tickSizeOuter = axis.tickSizeOuter();
  const tickSizeInner = axis.tickSizeInner();
  const tickPadding = axis.tickPadding();
  // same as for xAxis but consider height of the screen ~two times smaller
  const nTicks = ticks || Math.floor(height / 50) || 1;
  const values = scale.ticks(nTicks);
  const range = scale.range().map(r => r + halfStrokeWidth);
  const axisElement = (
    <g
      className="axis y-axis"
      fill="none"
      fontSize={tickFontSize}
      textAnchor={getTextAnchor({ yAxisPlacement })}
      strokeWidth={strokeWidth}
    >
      <path
        stroke={color}
        d={getPathString({
          range,
          strokeWidth,
          tickSizeOuter,
          width,
          yAxisPlacement,
        })}
      />
      {values.map(v => {
        const lineProps = {
          stroke: color,
          ...getLineProps({
            strokeWidth,
            tickSizeInner,
            width,
            yAxisPlacement,
          }),
        };

        const textProps = {
          fill: color,
          dy: '0.32em',
          ...getTextProps({
            strokeWidth,
            tickPadding,
            tickSizeInner,
            width,
            yAxisPlacement,
          }),
        };
        return (
          <g key={+v} opacity={1} transform={`translate(0, ${scale(v)})`}>
            <line {...lineProps} />
            <text className="tick-value" {...textProps}>
              {tickFormatter(+v, values)}
            </text>
          </g>
        );
      })}
    </g>
  );
  const cursor = zoomable ? 'move' : 'inherit';
  return (
    <g
      className="axis-y"
      transform={`translate(${offsetx}, 0)`}
      cursor={cursor}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {axisElement}
      {zoomable && (
        <ZoomRect
          width={width}
          height={height}
          zoomAxes={{ y: true }}
          itemIds={[getItem(series, collection).id]}
        />
      )}
    </g>
  );
};

YAxis.propTypes = propTypes;
YAxis.defaultProps = defaultProps;

export default props => (
  <ScalerContext.Consumer>
    {({ subDomainsByItemId }) => (
      <YAxis {...props} subDomainsByItemId={subDomainsByItemId} />
    )}
  </ScalerContext.Consumer>
);
