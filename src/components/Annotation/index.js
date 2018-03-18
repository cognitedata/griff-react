import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const Annotation = ({ data, xScale, height, color, fillOpacity, id }) => {
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
    <rect
      x={xScale(data[0])}
      y={0}
      height={height}
      width={xScale(data[1]) - xScale(data[0])}
      style={{ stroke: color, fill: color, fillOpacity }}
    />
  );
};

Annotation.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  xScale: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
  id: PropTypes.number.isRequired,
  color: PropTypes.string,
  fillOpacity: PropTypes.number,
};

Annotation.defaultProps = {
  color: '#e8336d',
  fillOpacity: 0.1,
};

export default Annotation;
