import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const Line = ({
  data,
  xAccessor,
  yAccessor,
  y0Accessor,
  y1Accessor,
  xScale,
  yScale,
  color,
  step,
  hidden,
  drawPoints,
  strokeWidth,
  clipPath,
}) => {
  let line;
  let area;
  // HTML has an issue with drawing points somewhere in the 30-35M range.
  // There's no point in drawing pixels more than 30k pixels outside of the range
  // so this hack will work for a while.
  // Without this, when zoomed far enough in the line will disappear.
  const boundedSeries = value => Math.min(Math.max(value, -30000), 30000);
  if (step) {
    line = d3
      .line()
      .curve(d3.curveStepAfter)
      .x(d => boundedSeries(xScale(xAccessor(d))))
      .y(d => boundedSeries(yScale(yAccessor(d))));
    if (y0Accessor && y1Accessor) {
      area = d3
        .area()
        .curve(d3.curveStepAfter)
        .x(d => boundedSeries(xScale(xAccessor(d))))
        .y0(d => boundedSeries(yScale(y0Accessor(d))))
        .y1(d => boundedSeries(yScale(y1Accessor(d))));
    }
  } else {
    line = d3
      .line()
      .x(d => boundedSeries(xScale(xAccessor(d))))
      .y(d => boundedSeries(yScale(yAccessor(d))));
    if (y0Accessor && y1Accessor) {
      area = d3
        .area()
        .x(d => boundedSeries(xScale(xAccessor(d))))
        .y0(d => boundedSeries(yScale(y0Accessor(d))))
        .y1(d => boundedSeries(yScale(y1Accessor(d))));
    }
  }
  let circles = null;
  if (drawPoints) {
    const subDomain = xScale.domain().map(p => p.getTime());
    circles = data
      .filter(d => {
        const x = xAccessor(d);
        return x >= subDomain[0] && x <= subDomain[1];
      })
      .map(d => (
        <circle
          key={xAccessor(d)}
          className="line-circle"
          r={3}
          cx={xScale(xAccessor(d))}
          cy={boundedSeries(yScale(yAccessor(d)))}
          fill={color}
        />
      ));
  }
  return (
    <g clipPath={`url(#${clipPath})`}>
      {area && (
        <path
          d={area(data)}
          style={{
            stroke: 'none',
            strokeWidth: `${strokeWidth}px`,
            fill: `${color}`,
            opacity: 0.25,
            display: hidden ? 'none' : 'inherit',
          }}
        />
      )}
      <path
        d={line(data)}
        style={{
          stroke: color,
          strokeWidth: `${strokeWidth}px`,
          fill: 'none',
          display: hidden ? 'none' : 'inherit',
        }}
      />
      {circles}
    </g>
  );
};

Line.propTypes = {
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
  // eslint-disable-next-line
  data: PropTypes.array.isRequired,
  // Data can take any form as long as the xAccessor and yAccessors are set.
  xAccessor: PropTypes.func.isRequired,
  yAccessor: PropTypes.func.isRequired,
  y0Accessor: PropTypes.func,
  y1Accessor: PropTypes.func,
  color: PropTypes.string.isRequired,
  step: PropTypes.bool,
  hidden: PropTypes.bool,
  drawPoints: PropTypes.bool,
  strokeWidth: PropTypes.number,
  clipPath: PropTypes.string.isRequired,
};

Line.defaultProps = {
  step: false,
  hidden: false,
  drawPoints: false,
  strokeWidth: 1,
  y0Accessor: null,
  y1Accessor: null,
};

export default Line;
