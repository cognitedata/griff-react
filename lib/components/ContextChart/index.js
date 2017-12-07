'use strict';

exports.__esModule = true;
exports.default = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _d = require('d3');

var d3 = _interopRequireWildcard(_d);

var _Axis = require('../Axis');

var _Axis2 = _interopRequireDefault(_Axis);

var _Line = require('../Line');

var _Line2 = _interopRequireDefault(_Line);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ContextChart = function (_Component) {
  _inherits(ContextChart, _Component);

  function ContextChart() {
    var _temp, _this, _ret;

    _classCallCheck(this, ContextChart);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.didBrush = function () {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') {
        return;
      }
      var s = d3.event.selection || _this.props.xScale.range();
      var scale = _this.props.xScale;
      var domain = s.map(scale.invert, scale).map(function (p) {
        return p.getTime();
      });
      _this.props.subDomainChanged(domain);
      if (d3.event.type === 'end') {
        _this.props.updateTransformation(s);
      }
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  ContextChart.prototype.componentDidMount = function componentDidMount() {
    var _props = this.props,
        width = _props.width,
        height = _props.height,
        heightPct = _props.heightPct;

    this.brush = d3.brushX().extent([[0, 0], [width, height * heightPct]]).on('brush end', this.didBrush);
    this.selection = d3.select(this.brushNode);
    this.selection.call(this.brush);
    this.selection.call(this.brush.move, [0, width]);
  };

  ContextChart.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    if (prevProps.subDomain[0] !== this.props.subDomain[0] || prevProps.subDomain[1] !== this.props.subDomain[1]) {
      var _props2 = this.props,
          subDomain = _props2.subDomain,
          height = _props2.height,
          heightPct = _props2.heightPct;

      var scale = this.props.xScale;
      var range = subDomain.map(scale);
      this.brush.extent([[0, 0], [this.props.width, height * heightPct]]);
      this.selection.call(this.brush.move, range);
      this.selection.call(this.brush);
    }
    if (prevProps.width !== this.props.width) {
      this.brush.extent([[0, 0], [0, this.props.width]]);
      this.selection.call(this.brush.move, [0, this.props.width]);
      this.selection.call(this.brush);
    }
  };

  ContextChart.prototype.render = function render() {
    var _this2 = this;

    var _props3 = this.props,
        yAxis = _props3.yAxis,
        xAxis = _props3.xAxis,
        series = _props3.series,
        height = _props3.height,
        heightPct = _props3.heightPct,
        offsetY = _props3.offsetY,
        xScale = _props3.xScale;

    var effectiveHeight = height * heightPct;
    return _react2.default.createElement(
      'g',
      { className: 'context-chart', transform: 'translate(0, ' + offsetY + ')' },
      _react2.default.createElement(_Axis2.default, {
        key: 'axis--x',
        scale: xScale,
        mode: 'x',
        offsety: effectiveHeight,
        offsetx: 0
      }),
      Object.keys(series).map(function (key) {
        var serie = series[key];
        var yDomain = yAxis.calculateDomain(serie.data);
        var yScale = d3.scaleLinear().domain(yDomain).range([effectiveHeight, 0]);
        return _react2.default.createElement(_Line2.default, {
          key: 'line--' + key,
          data: serie.data,
          xScale: xScale,
          yScale: yScale,
          xAccessor: serie.xAccessor || xAxis.accessor,
          yAccessor: serie.yAccessor || yAxis.accessor,
          color: serie.color
        });
      }),
      _react2.default.createElement('g', {
        className: 'context-brush',
        ref: function ref(_ref) {
          _this2.brushNode = _ref;
        }
      })
    );
  };

  return ContextChart;
}(_react.Component);

exports.default = ContextChart;
module.exports = exports['default'];