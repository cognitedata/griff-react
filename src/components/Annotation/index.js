import React from 'react';
import PropTypes from 'prop-types';

function Annotation({ data, xScale, height, color, fillOpacity, id }) {
  return (
    <rect
      key={id}
      x={xScale(data[0])}
      y={0}
      height={height}
      width={xScale(data[1]) - xScale(data[0])}
      style={{ stroke: color, fill: color, fillOpacity }}
    />
  );
}

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
