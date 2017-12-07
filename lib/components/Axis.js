'use strict';

exports.__esModule = true;
exports.default = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _d = require('d3');

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var tickTransformer = {
  x: function x(v) {
    return 'translate(' + v + ', 0)';
  },
  y: function y(v) {
    return 'translate(0, ' + v + ')';
  }
};

var Axis = function (_Component) {
  _inherits(Axis, _Component);

  function Axis() {
    var _temp, _this, _ret;

    _classCallCheck(this, Axis);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.didZoom = function () {
      var t = d3.event.transform;
      _this.props.updateYScale(t, _this.props.id);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  Axis.prototype.componentWillMount = function componentWillMount() {
    this.zoom = d3.zoom().scaleExtent([0.05, 1000]).translateExtent([[0, 0], [this.props.width, this.props.offsety]]).extent([[0, 0], [this.props.width, this.props.offsety]]).on('zoom', this.didZoom);
  };

  Axis.prototype.componentDidMount = function componentDidMount() {
    this.selection = d3.select(this.zoomNode);
    this.selection.call(this.zoom);
  };

  Axis.prototype.renderZoomRect = function renderZoomRect() {
    var _this2 = this;

    if (this.props.mode === 'x') {
      return null;
    }
    var _props = this.props,
        offsetx = _props.offsetx,
        offsety = _props.offsety,
        width = _props.width;

    return _react2.default.createElement('rect', {
      width: width,
      height: offsety,
      x: offsetx,
      fill: 'none',
      pointerEvents: 'all',
      ref: function ref(_ref) {
        _this2.zoomNode = _ref;
      }
    });
  };

  Axis.prototype.renderAxis = function renderAxis() {
    var _props2 = this.props,
        scale = _props2.scale,
        mode = _props2.mode,
        offsetx = _props2.offsetx,
        offsety = _props2.offsety,
        _props2$strokeColor = _props2.strokeColor,
        strokeColor = _props2$strokeColor === undefined ? 'black' : _props2$strokeColor;

    var axis = mode === 'x' ? d3.axisBottom(scale) : d3.axisRight(scale);
    var tickFontSize = 14;
    var strokeWidth = 2;
    var halfStrokeWidth = strokeWidth / 2;
    var tickSizeOuter = axis.tickSizeOuter();
    var tickSizeInner = axis.tickSizeInner();
    var tickPadding = axis.tickPadding();
    var values = scale.ticks();
    var k = 1;
    var x = mode === 'x' ? 'x' : 'y';
    var y = mode === 'x' ? 'y' : 'x';
    var tickFormat = scale.tickFormat();
    var range = scale.range().map(function (r) {
      return r + halfStrokeWidth;
    });
    var pathString = void 0;
    if (mode === 'x') {
      pathString = 'M' + range[0] + ',' + k * tickSizeOuter + 'V' + halfStrokeWidth + 'H' + range[1] + 'V' + k * tickSizeOuter;
    } else {
      pathString = 'M' + k * tickSizeOuter + ',' + range[0] + 'H' + halfStrokeWidth + 'V' + range[1] + 'H' + k * tickSizeOuter;
    }
    return _react2.default.createElement(
      'g',
      {
        className: 'axis',
        fill: 'none',
        fontSize: tickFontSize,
        textAnchor: mode === 'x' ? 'middle' : 'start',
        strokeWidth: strokeWidth,
        transform: mode === 'x' ? 'translate(' + offsetx + ', ' + offsety + ')' : 'translate(' + offsetx + ', 0)'
      },
      _react2.default.createElement('path', { stroke: strokeColor, d: pathString }),
      values.map(function (v) {
        var lineProps = { stroke: strokeColor };
        lineProps[y + '2'] = k * tickSizeInner;
        lineProps[x + '1'] = halfStrokeWidth;
        lineProps[x + '2'] = halfStrokeWidth;

        var textProps = {
          fill: strokeColor,
          dy: mode === 'x' ? '0.71em' : '0.32em'
        };
        textProps[y] = k * Math.max(tickSizeInner, 0) + tickPadding;
        textProps[x] = halfStrokeWidth;
        return _react2.default.createElement(
          'g',
          { key: +v, opacity: 1, transform: tickTransformer[mode](scale(v)) },
          _react2.default.createElement('line', lineProps),
          _react2.default.createElement(
            'text',
            textProps,
            tickFormat(v)
          )
        );
      })
    );
  };

  Axis.prototype.render = function render() {
    return _react2.default.createElement(
      'g',
      { className: 'axis-' + this.props.mode },
      this.renderAxis(),
      this.renderZoomRect()
    );
  };

  return Axis;
}(_react.Component);

exports.default = Axis;
module.exports = exports['default'];