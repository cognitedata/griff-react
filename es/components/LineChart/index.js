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

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.state = {
      linex: null,
      liney: null
    }, _this.zoomed = function () {
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
        rescaleY = _props.rescaleY,
        colors = _props.colors,
        _onMouseMove = _props.onMouseMove;

    var effectiveHeight = height * heightPct;
    var _state = this.state,
        linex = _state.linex,
        liney = _state.liney;

    return React.createElement(
      'g',
      { className: 'line-chart', transform: 'translate(0, ' + offsetY + ')' },
      linex && liney && [React.createElement('line', {
        key: 0,
        x1: 0,
        x2: width,
        stroke: '#ccc',
        strokeWidth: 1,
        y1: liney,
        y2: liney
      }), React.createElement('line', {
        key: 1,
        y1: 0,
        y2: effectiveHeight,
        stroke: '#ccc',
        strokeWidth: '1',
        x1: linex,
        x2: linex
      })],
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
        var yDomain = yAxis.calculateDomain ? yAxis.calculateDomain(serie.data) : d3.extent(serie.data, serie.yAccessor || yAxis.accessor);
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
          strokeColor: colors[key],
          updateYScale: _this2.props.updateYScale
        }), React.createElement(Line, {
          key: 'line--' + key,
          data: serie.data,
          xScale: xScale,
          xAccessor: serie.xAccessor || xAxis.accessor,
          yAccessor: serie.yAccessor || yAxis.accessor,
          yScale: yScale,
          color: colors[key],
          step: serie.step
        })];
      }),
      React.createElement('rect', {
        ref: function ref(_ref) {
          _this2.zoomNode = _ref;
        },
        width: width,
        height: effectiveHeight,
        pointerEvents: 'all',
        fill: 'none',
        onMouseMove: function onMouseMove(e) {
          if (Object.keys(series).length === 0) {
            return;
          }
          var xpos = e.nativeEvent.offsetX;
          var ypos = e.nativeEvent.offsetY;
          var rawTimestamp = xScale.invert(xpos).getTime();
          var serieKeys = Object.keys(series);
          var serie = series[serieKeys[0]];
          var points = {};
          serieKeys.forEach(function (key) {
            var data = series[key].data;

            var rawX = d3.bisector(function (d) {
              return d.timestamp;
            }).left(data, rawTimestamp, 1);
            var x0 = data[rawX - 1];
            var x1 = data[rawX];
            var d = null;
            if (x0 && !x1) {
              d = x0;
            } else if (x1 && !x0) {
              d = x1;
            } else if (!x0 && !x1) {
              d = null;
            } else {
              d = rawTimestamp - x0.timestamp > x1.timestamp - rawTimestamp ? x1 : x0;
            }
            if (d) {
              points[key] = yAxis.accessor(d);
              _this2.setState({ linex: xpos, liney: ypos });
            } else {
              points[key] = data[data.length - 1];
              _this2.setState({ linex: 0, liney: 0 });
            }
          });
          if (Object.keys(points).length > 0) {
            _onMouseMove(points);
          }
        },
        onMouseOut: function onMouseOut(e) {
          _this2.setState({ linex: null, liney: null });
        }
      })
    );
  };

  return LineChart;
}(Component);

export { LineChart as default };