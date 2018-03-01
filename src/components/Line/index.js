import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const Line = ({
  data,
  xAccessor,
  yAccessor,
  xScale,
  yScale,
  color,
  step,
  hidden,
  drawPoints,
}) => {
  let line;
  if (step) {
    line = d3
      .line()
      .curve(d3.curveStepAfter)
      .x(d => xScale(xAccessor(d)))
      .y(d => yScale(yAccessor(d)));
  } else {
    line = d3
      .line()
      .x(d => xScale(xAccessor(d)))
      .y(d => yScale(yAccessor(d)));
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
          cy={yScale(yAccessor(d))}
          fill={color}
        />
      ));
  }
  return (
    <g clipPath="url(#linechart-clip-path)">
      <path
        d={line(data)}
        style={{
          stroke: color,
          strokeWidth: '1px',
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
  data: PropTypes.array.isRequired,
  xAccessor: PropTypes.func.isRequired,
  yAccessor: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
  step: PropTypes.bool,
  hidden: PropTypes.bool,
  drawPoints: PropTypes.bool,
};

Line.defaultProps = {
  step: false,
  hidden: false,
  drawPoints: false,
};

export default Line;
