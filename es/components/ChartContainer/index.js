var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _class, _temp, _initialiseProps;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import * as d3 from 'd3';

var ChartContainer = (_temp = _class = function (_Component) {
  _inherits(ChartContainer, _Component);

  function ChartContainer(props) {
    _classCallCheck(this, ChartContainer);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _initialiseProps.call(_this);

    var _this$props = _this.props,
        height = _this$props.height,
        yAxisWidth = _this$props.yAxis.width,
        margin = _this$props.margin,
        width = _this$props.width;

    var nSeries = Object.keys(_this.props.series).length;
    var chartWidth = width - yAxisWidth * nSeries - margin.left - margin.right;
    _this.zoom = d3.zoom().scaleExtent([1, 10000]).translateExtent([[0, 0], [chartWidth, height]]).extent([[0, 0], [chartWidth, height]]);
    _this.state = {
      transformation: {},
      rescaleY: {}
    };
    return _this;
  }

  ChartContainer.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    if (Object.keys(prevProps.series).length !== Object.keys(this.props.series).length) {
      var _props = this.props,
          yAxisWidth = _props.yAxis.width,
          margin = _props.margin,
          width = _props.width,
          height = _props.height;

      var nSeries = Object.keys(this.props.series).length;
      var chartWidth = width - yAxisWidth * nSeries - margin.left - margin.right;
      this.zoom.translateExtent([[0, 0], [chartWidth, height]]).extent([[0, 0], [chartWidth, height]]);
    }
  };

  ChartContainer.prototype.render = function render() {
    var _this2 = this;

    var _props2 = this.props,
        series = _props2.series,
        margin = _props2.margin,
        width = _props2.width,
        domain = _props2.domain,
        subDomain = _props2.subDomain;

    var nSeries = Object.keys(series).length;
    var yAxisWidth = this.props.yAxis.width;
    var chartWidth = this.props.width - yAxisWidth * nSeries - margin.left - margin.right;
    var chartHeight = this.props.height - margin.top - margin.bottom - 10;
    var heightOffset = 0;
    var xScale = d3.scaleTime().domain(domain).range([0, chartWidth]);
    var subXScale = d3.scaleTime().domain(subDomain).range([0, chartWidth]);
    var children = React.Children.map(this.props.children, function (child) {
      heightOffset += ((child.props.margin || {}).top || 0) * chartHeight;
      var c = React.cloneElement(child, _extends({}, _this2.props, {
        subDomainChanged: _this2.subDomainChanged,
        width: chartWidth,
        offsetY: heightOffset,
        xScale: xScale,
        transformation: _this2.state.transformation,
        subXScale: subXScale,
        height: chartHeight,
        zoom: _this2.zoom,
        updateTransformation: _this2.updateTransformation,
        updateYScale: _this2.updateYScale,
        rescaleY: _this2.state.rescaleY
      }));
      heightOffset += chartHeight * c.props.heightPct;
      return c;
    });
    return React.createElement(
      'svg',
      { width: width, height: this.props.height },
      React.createElement(
        'g',
        { transform: 'translate(' + margin.left + ', ' + margin.top + ')' },
        children
      )
    );
  };

  return ChartContainer;
}(Component), _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.subDomainChanged = function (domain) {
    _this3.props.subDomainChanged(domain);
  };

  this.updateTransformation = function (s) {
    var _props3 = _this3.props,
        margin = _props3.margin,
        series = _props3.series,
        yAxisWidth = _props3.yAxis.width;

    var nSeries = Object.keys(series).length;
    var width = _this3.props.width - yAxisWidth * nSeries - margin.left - margin.right;
    _this3.setState({
      transformation: d3.zoomIdentity.scale(width / (s[1] - s[0])).translate(-s[0], 0)
    });
  };

  this.updateYScale = function (rescaleY, key) {
    var _extends2;

    _this3.setState({
      rescaleY: _extends({}, _this3.state.rescaleY, (_extends2 = {}, _extends2[key] = rescaleY, _extends2))
    });
  };
}, _temp);


export default ChartContainer;