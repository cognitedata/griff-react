import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const Annotation = ({ data, xScale, height, color, fillOpacity }) => {
  const fixedData = [
    [data[0], 0],
    [data[1], 0],
    [data[1], height],
    [data[0], height],
    [data[0], 0],
  ];
  const line = d3
    .line()
    .x(d => xScale(d[0]))
    .y(d => d[1]);
  const d = line(fixedData);
  return (
    <path
      d={d}
      style={{ stroke: color, fill: color, fillOpacity }}
      clipPath="url(#linechart-clip-path)"
    />
  );
};

Annotation.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  xScale: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
  color: PropTypes.string,
  fillOpacity: PropTypes.number,
};

Annotation.defaultProps = {
  color: '#e8336d',
  fillOpacity: 0.1,
};

export default Annotation;
