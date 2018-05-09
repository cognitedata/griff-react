import React from 'react';
import Scaler from '../Scaler';

const getChartWidth = ({ width, yAxis, margin, series }) => {
  const { width: yAxisWidth, display: yAxisDisplayMode } = yAxis;
  const nSeries = Object.keys(series).length;
  const nHiddenSeries = Object.keys(series).reduce(
    (p, c) => (p + c.hidden ? 1 : 0),
    0
  );
  const visibleAxesCount =
    yAxisDisplayMode === 'NONE' ? 0 : nSeries - nHiddenSeries;
  return width - yAxisWidth * visibleAxesCount - margin.left - margin.right;
};

export default ({
  width,
  height,
  yAxis,
  margin,
  series,
  children,
  ...props
}) => {
  const chartWidth = getChartWidth({ width, yAxis, margin, series });
  const chartHeight = height - margin.top - margin.bottom - 10;
  let heightOffset = 0;
  const mutatedChildren = React.Children.map(children, child => {
    if (child === null) {
      // Handling the conditional rendering of children
      return null;
    }
    heightOffset += ((child.props.margin || {}).top || 0) * chartHeight;
    const c = React.cloneElement(child, {
      ...props,
      margin,
      series,
      width: chartWidth,
      offsetY: heightOffset,
      height: chartHeight,
    });
    heightOffset += chartHeight * c.props.heightPct;
    return c;
  });
  return (
    <svg width={width} height={height}>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        <Scaler
          {...props}
          margin={margin}
          series={series}
          width={chartWidth}
          height={chartHeight}
        >
          {mutatedChildren}
        </Scaler>
      </g>
    </svg>
  );
};
