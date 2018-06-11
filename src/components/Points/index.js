import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const propTypes = {};
const defaultProps = {};

const Points = ({
  data,
  xAccessor,
  yAccessor,
  zAccessor,
  xScale,
  yScale,
  color,
  hidden,
  drawPoints,
  strokeWidth,
}) => {
  const points = data.map(d => (
    <circle
      key={`${xAccessor(d)}-${yAccessor(d)}`}
      className="scatterplot-point"
      r={3}
      cx={xScale(xAccessor(d))}
      cy={yScale(yAccessor(d))}
      fill={color}
    />
  ));
  return <g>{points}</g>;
};

Points.propTypes = propTypes;
Points.defaultProps = defaultProps;

export default Points;
