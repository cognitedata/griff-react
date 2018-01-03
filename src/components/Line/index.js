import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const Line = ({ data, xAccessor, yAccessor, xScale, yScale, color, step }) => {
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
  return (
    <path
      d={line(data)}
      style={{
        stroke: color,
        strokeWidth: '1.5px',
        fill: 'none'
      }}
      clipPath="url(#linechart-clip-path)"
    />
  );
};

Line.propTypes = {
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  xAccessor: PropTypes.func.isRequired,
  yAccessor: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
  step: PropTypes.bool.isRequired
};

export default Line;
