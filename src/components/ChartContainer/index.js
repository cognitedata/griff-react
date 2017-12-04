import React, { Component } from 'react';
import * as d3 from 'd3';

class ChartContainer extends Component {
  constructor(props) {
    super(props);
    const { height, yAxis: { width: yAxisWidth }, margin, width } = this.props;
    const nSeries = Object.keys(this.props.series).length;
    const chartWidth =
      width - yAxisWidth * nSeries - margin.left - margin.right;
    this.zoom = d3
      .zoom()
      .scaleExtent([1, 1000])
      .translateExtent([[0, 0], [chartWidth, height]])
      .extent([[0, 0], [chartWidth, height]]);
    this.state = {
      transformation: {},
      rescaleY: {},
    };
  }

  componentDidUpdate(prevProps) {
    if (
      Object.keys(prevProps.series).length !==
      Object.keys(this.props.series).length
    ) {
      const {
        yAxis: { width: yAxisWidth },
        margin,
        width,
        height,
      } = this.props;
      const nSeries = Object.keys(this.props.series).length;
      const chartWidth =
        width - yAxisWidth * nSeries - margin.left - margin.right;
      this.zoom
        .translateExtent([[0, 0], [chartWidth, height]])
        .extent([[0, 0], [chartWidth, height]]);
    }
  }

  subDomainChanged = domain => {
    this.props.subDomainChanged(domain);
  };

  updateTransformation = s => {
    const { margin, series, yAxis: { width: yAxisWidth } } = this.props;
    const nSeries = Object.keys(series).length;
    const width =
      this.props.width - yAxisWidth * nSeries - margin.left - margin.right;
    this.setState({
      transformation: d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0),
    });
  };

  updateYScale = (rescaleY, key) => {
    this.setState({
      rescaleY: {
        ...this.state.rescaleY,
        [key]: rescaleY,
      },
    });
  };

  render() {
    const { series, margin, width, height, domain, subDomain } = this.props;
    const nSeries = Object.keys(series).length;
    const yAxisWidth = this.props.yAxis.width;
    const chartWidth =
      this.props.width - yAxisWidth * nSeries - margin.left - margin.right;
    let heightOffset = 0;
    const xScale = d3
      .scaleTime()
      .domain(domain)
      .range([0, chartWidth]);
    const subXScale = d3
      .scaleTime()
      .domain(subDomain)
      .range([0, chartWidth]);
    const children = React.Children.map(this.props.children, child => {
      heightOffset += ((child.props.margin || {}).top || 0) * height;
      const c = React.cloneElement(child, {
        ...this.props,
        subDomainChanged: this.subDomainChanged,
        width: chartWidth,
        offsetY: heightOffset,
        xScale,
        transformation: this.state.transformation,
        subXScale,
        zoom: this.zoom,
        updateTransformation: this.updateTransformation,
        updateYScale: this.updateYScale,
        rescaleY: this.state.rescaleY,
      });
      heightOffset += height * c.props.heightPct;
      return c;
    });
    return (
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>{children}</g>
      </svg>
    );
  }
}

export default ChartContainer;
