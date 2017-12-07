import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

var Line = function Line(_ref) {
  var data = _ref.data,
      xAccessor = _ref.xAccessor,
      yAccessor = _ref.yAccessor,
      xScale = _ref.xScale,
      yScale = _ref.yScale,
      color = _ref.color;

  var line = d3.line().x(function (d) {
    return xScale(xAccessor(d));
  }).y(function (d) {
    return yScale(yAccessor(d));
  });
  return React.createElement('path', {
    d: line(data),
    style: {
      stroke: color,
      strokeWidth: '1.5px',
      fill: 'none'
    },
    clipPath: 'url(#linechart-clip-path)'
  });
};

Line.propTypes = process.env.NODE_ENV !== "production" ? {
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  xAccessor: PropTypes.func.isRequired,
  yAccessor: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired
} : {};

export default Line;