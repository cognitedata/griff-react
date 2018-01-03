function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import * as d3 from 'd3';
import Axis from '../Axis';
import Line from '../Line';
import simplify from '../../utils/simplify-points';

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
      var _props3 = this.props,
          _height = _props3.height,
          _heightPct = _props3.heightPct,
          width = _props3.width;

      this.brush.extent([[0, 0], [width, _height * _heightPct]]);
      this.selection.call(this.brush.move, [0, width]);
      this.selection.call(this.brush);
    }
  };

  ContextChart.prototype.render = function render() {
    var _this2 = this;

    var _props4 = this.props,
        yAxis = _props4.yAxis,
        xAxis = _props4.xAxis,
        series = _props4.contextSeries,
        height = _props4.height,
        heightPct = _props4.heightPct,
        offsetY = _props4.offsetY,
        xScale = _props4.xScale,
        colors = _props4.colors;

    var effectiveHeight = height * heightPct;
    return React.createElement(
      'g',
      { className: 'context-chart', transform: 'translate(0, ' + offsetY + ')' },
      React.createElement(Axis, {
        key: 'axis--x',
        scale: xScale,
        mode: 'x',
        offsety: effectiveHeight,
        offsetx: 0
      }),
      Object.keys(series).map(function (key) {
        var serie = series[key];
        var yDomain = yAxis.calculateDomain ? yAxis.calculateDomain(serie.data) : d3.extent(serie.data, serie.yAccessor || yAxis.accessor);
        var yScale = d3.scaleLinear().domain(yDomain).range([effectiveHeight, 0]);
        return React.createElement(Line, {
          key: 'line--' + key,
          data: serie.data,
          xScale: xScale,
          yScale: yScale,
          xAccessor: serie.xAccessor || xAxis.accessor,
          yAccessor: serie.yAccessor || yAxis.accessor,
          color: colors[key],
          step: serie.step
        });
      }),
      React.createElement('g', {
        className: 'context-brush',
        ref: function ref(_ref) {
          _this2.brushNode = _ref;
        }
      })
    );
  };

  return ContextChart;
}(Component);

export { ContextChart as default };