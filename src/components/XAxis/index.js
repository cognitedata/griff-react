import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { SizeMe } from 'react-sizeme';
import GriffPropTypes from '../../utils/proptypes';
import AxisPlacement from '../AxisPlacement';
import ScalerContext from '../../context/Scaler';
import ZoomRect from '../ZoomRect';
import Axes from '../../utils/Axes';
import { createXScale } from '../../utils/scale-helpers';

const tickTransformer = v => `translate(${v}, 0)`;

/**
 * This is only used for rendering the ticks on the x-axis when it is used to
 * render time. Everywhere else in the library, {@link createXScale} should be
 * used to create scales.
 *
 * @param {number[]} domain
 * @param {number} width
 */
const createTimeScale = (domain, width) =>
  d3
    .scaleTime()
    .domain(domain)
    .range([0, width]);

const X_SCALER_FACTORY = {
  [Axes.time]: createTimeScale,
  [Axes.x]: createXScale,
};

const propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  stroke: PropTypes.string,
  // (number, values) => String
  tickFormatter: PropTypes.func,
  ticks: PropTypes.number,
  placement: GriffPropTypes.axisPlacement,
  scaled: PropTypes.bool,
  axis: GriffPropTypes.axes,

  // These are provided by Griff.
  series: GriffPropTypes.multipleSeries.isRequired,
  domainsByItemId: GriffPropTypes.domainsByItemId.isRequired,
  subDomainsByItemId: GriffPropTypes.subDomainsByItemId.isRequired,
};

const defaultProps = {
  stroke: 'black',
  width: 1,
  height: 50,
  ticks: 0,
  placement: AxisPlacement.BOTTOM,
  tickFormatter: Number,
  scaled: true,
  axis: Axes.time,
};

const getLineProps = ({ tickSizeInner, strokeWidth, height, placement }) => {
  switch (placement) {
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

const getPathString = ({
  height,
  placement,
  range,
  strokeWidth,
  tickSizeOuter,
}) => {
  switch (placement) {
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

const getTextProps = ({
  height,
  placement,
  strokeWidth,
  tickPadding,
  tickSizeInner,
}) => {
  switch (placement) {
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

const XAxis = ({
  axis: a,
  domainsByItemId,
  height,
  placement,
  scaled,
  series,
  stroke,
  subDomainsByItemId,
  tickFormatter,
  ticks,
  width,
}) => {
  const scale = X_SCALER_FACTORY[a](
    (scaled ? subDomainsByItemId : domainsByItemId)[
      Object.keys(domainsByItemId)[0]
    ][a],
    width
  );
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
  const range = scale.range().map(r => r + halfStrokeWidth);
  const pathString = getPathString({
    height,
    placement,
    range,
    strokeWidth,
    tickSizeOuter,
  });
  const axisElement = (
    <g
      className="axis x-axis"
      fill="none"
      fontSize={tickFontSize}
      textAnchor="middle"
      strokeWidth={strokeWidth}
    >
      <path stroke={stroke} d={pathString} />
      {values.map(v => {
        const lineProps = {
          stroke,
          ...getLineProps({
            height,
            placement,
            strokeWidth,
            tickSizeInner,
          }),
        };

        const textProps = {
          fill: stroke,
          dy: '0.71em',
          ...getTextProps({ strokeWidth, tickPadding, tickSizeInner }),
        };
        return (
          <g key={+v} opacity={1} transform={tickTransformer(scale(v))}>
            <line stroke={stroke} {...lineProps} />
            <text className="tick-value" {...textProps}>
              {tickFormatter(+v, values)}
            </text>
          </g>
        );
      })}
    </g>
  );

  return (
    <svg
      width={width}
      style={{ width: '100%', display: 'block' }}
      height={height}
    >
      {axisElement}
      <ZoomRect
        width={width}
        height={height}
        itemIds={series.filter(s => !s.hidden).map(s => s.id)}
        zoomAxes={{ [a]: true }}
      />
    </svg>
  );
};

XAxis.propTypes = propTypes;
XAxis.defaultProps = defaultProps;

export default props => (
  <ScalerContext.Consumer>
    {({ domainsByItemId, subDomainsByItemId, series }) => (
      <SizeMe monitorWidth>
        {({ size }) => (
          <XAxis
            series={series}
            {...props}
            width={size.width}
            domainsByItemId={domainsByItemId}
            subDomainsByItemId={subDomainsByItemId}
          />
        )}
      </SizeMe>
    )}
  </ScalerContext.Consumer>
);
