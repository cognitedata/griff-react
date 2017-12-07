function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import * as d3 from 'd3';
import Line from '../Line';
import Axis from '../Axis';

var LineChart = function (_Component) {
  _inherits(LineChart, _Component);

  function LineChart() {
    var _temp, _this, _ret;

    _classCallCheck(this, LineChart);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.zoomed = function () {
      var t = d3.event.transform;
      var scale = _this.props.xScale;
      var newScale = t.rescaleX(scale);
      var dd = newScale.domain().map(function (p) {
        return p.getTime();
      });
      return _this.props.subDomainChanged(dd);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  LineChart.prototype.componentDidMount = function componentDidMount() {
    this.selection = d3.select(this.zoomNode);
    this.selection.call(this.props.zoom.on('zoom', this.zoomed));
  };

  LineChart.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    var _props$transformation = this.props.transformation,
        x = _props$transformation.x,
        k = _props$transformation.k;
    var _prevProps$transforma = prevProps.transformation,
        prevx = _prevProps$transforma.x,
        prevk = _prevProps$transforma.k;

    if (!(x === prevx && k === prevk)) {
      this.selection.call(this.props.zoom.transform, this.props.transformation);
    }
  };

  LineChart.prototype.render = function render() {
    var _this2 = this;

    var _props = this.props,
        yAxis = _props.yAxis,
        xAxis = _props.xAxis,
        series = _props.series,
        height = _props.height,
        width = _props.width,
        heightPct = _props.heightPct,
        offsetY = _props.offsetY,
        xScale = _props.subXScale,
        rescaleY = _props.rescaleY;

    var effectiveHeight = height * heightPct;
    return React.createElement(
      'g',
      { className: 'line-chart', transform: 'translate(0, ' + offsetY + ')' },
      React.createElement(
        'clipPath',
        { id: 'linechart-clip-path' },
        React.createElement('rect', { width: width, height: effectiveHeight, fill: 'none' })
      ),
      React.createElement(Axis, {
        key: 'axis--x',
        scale: xScale,
        mode: 'x',
        offsetx: 0,
        offsety: effectiveHeight
      }),
      Object.keys(series).map(function (key, idx) {
        var serie = series[key];
        var yDomain = yAxis.calculateDomain(serie.data);
        var scaler = rescaleY[key];
        if (!scaler) {
          scaler = { rescaleY: function rescaleY(d) {
              return d;
            } };
        }
        var yScale = scaler.rescaleY(d3.scaleLinear().domain(yDomain).range([effectiveHeight, 0]));
        return [React.createElement(Axis, {
          key: 'axis--' + key,
          id: key,
          scale: yScale,
          mode: 'y',
          offsetx: width + idx * yAxis.width,
          width: yAxis.width,
          offsety: effectiveHeight,
          strokeColor: serie.color,
          updateYScale: _this2.props.updateYScale
        }), React.createElement(Line, {
          key: 'line--' + key,
          data: serie.data,
          xScale: xScale,
          xAccessor: serie.xAccessor || xAxis.accessor,
          yAccessor: serie.yAccessor || yAxis.accessor,
          yScale: yScale,
          color: serie.color
        })];
      }),
      React.createElement('rect', {
        ref: function ref(_ref) {
          _this2.zoomNode = _ref;
        },
        width: width,
        height: effectiveHeight,
        fill: 'none',
        pointerEvents: 'all'
      })
    );
  };

  return LineChart;
}(Component);

export { LineChart as default };