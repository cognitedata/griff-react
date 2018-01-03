'use strict';

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _d = require('d3');

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Line = function Line(_ref) {
  var data = _ref.data,
      xAccessor = _ref.xAccessor,
      yAccessor = _ref.yAccessor,
      xScale = _ref.xScale,
      yScale = _ref.yScale,
      color = _ref.color,
      step = _ref.step;

  var line = void 0;
  if (step) {
    line = d3.line().curve(d3.curveStepAfter).x(function (d) {
      return xScale(xAccessor(d));
    }).y(function (d) {
      return yScale(yAccessor(d));
    });
  } else {
    line = d3.line().x(function (d) {
      return xScale(xAccessor(d));
    }).y(function (d) {
      return yScale(yAccessor(d));
    });
  }
  return _react2.default.createElement('path', {
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
  xScale: _propTypes2.default.func.isRequired,
  yScale: _propTypes2.default.func.isRequired,
  data: _propTypes2.default.array.isRequired,
  xAccessor: _propTypes2.default.func.isRequired,
  yAccessor: _propTypes2.default.func.isRequired,
  color: _propTypes2.default.string.isRequired,
  step: _propTypes2.default.bool.isRequired
} : {};

exports.default = Line;
module.exports = exports['default'];