import React, { Component } from 'react';
import * as d3 from 'd3';

class ChartContainer extends Component {
  constructor(props) {
    super(props);
    const { height } = this.props;
    const chartWidth = this.getChartWidth();
    this.zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
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
      const { height } = this.props;
      const chartWidth = this.getChartWidth();
      this.zoom
        .translateExtent([[0, 0], [chartWidth, height]])
        .extent([[0, 0], [chartWidth, height]]);
    }
  }

  getChartWidth = () => {
    const {
      width,
      yAxis: { width: yAxisWidth, display: yAxisDisplayMode },
      hiddenSeries,
      margin,
      series,
    } = this.props;
    const nSeries = Object.keys(series).length;
    const nHiddenSeries = Object.keys(hiddenSeries).filter(
      s => hiddenSeries[s] === true
    ).length;
    const visibleAxesCount =
      yAxisDisplayMode === 'NONE' ? 0 : nSeries - nHiddenSeries;
    return width - yAxisWidth * visibleAxesCount - margin.left - margin.right;
  };

  getCalcSubDomain(series, hiddenSeries, xAxis, subDomain) {
    let min = Number.MIN_SAFE_INTEGER;
    let max = Number.MAX_SAFE_INTEGER;
    Object.keys(series)
      .filter(key => !hiddenSeries[key])
      .forEach(key => {
        const serie = series[key];
        const xAccessor = serie.xAccessor || xAxis.accessor;
        const data = serie.data.filter(d => {
          const value = xAccessor(d);
          return subDomain[0] < value && value < subDomain[1];
        });
        const xDomainSerie = this.calculateDomainFromData(data, xAccessor);
        min = Math.max(min, xDomainSerie[0]);
        max = Math.min(max, xDomainSerie[1]);
      });
    return min === Number.MIN_SAFE_INTEGER || max === Number.MAX_SAFE_INTEGER
      ? subDomain
      : [min, max];
  }

  calculateDomainFromData = (data, yAccessor) => {
    const extent = d3.extent(data, yAccessor);
    const diff = extent[1] - extent[0];
    if (Math.abs(diff) < 1e-3) {
      return [1 / 2 * extent[0], 3 / 2 * extent[0]];
    }
    return [extent[0] - diff * 0.025, extent[1] + diff * 0.025];
  };

  subDomainChanged = domain => {
    this.props.subDomainChanged(domain);
  };

  updateTransformation = s => {
    const {
      margin,
      series,
      yAxis: { width: yAxisWidth },
    } = this.props;
    const nSeries = Object.keys(series).length;
    const width = this.getChartWidth();
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
    const {
      series,
      margin,
      width,
      domain,
      subDomain,
      hiddenSeries,
      xAxis,
    } = this.props;

    const chartWidth = this.getChartWidth();
    const chartHeight = this.props.height - margin.top - margin.bottom - 10;
    let heightOffset = 0;
    const calcSubDomain = this.getCalcSubDomain(
      series,
      hiddenSeries,
      xAxis,
      subDomain
    );
    const xScale = d3
      .scaleTime()
      .domain(domain)
      .range([0, chartWidth]);
    const subXScale = d3
      .scaleTime()
      .domain(calcSubDomain)
      .range([0, chartWidth]);
    const children = React.Children.map(this.props.children, child => {
      if (child === null) {
        // Handling the conditional rendering of children, that will render false/null
        return null;
      }
      heightOffset += ((child.props.margin || {}).top || 0) * chartHeight;
      const c = React.cloneElement(child, {
        ...this.props,
        subDomainChanged: this.subDomainChanged,
        width: chartWidth,
        offsetY: heightOffset,
        xScale,
        transformation: this.state.transformation,
        subXScale,
        height: chartHeight,
        zoom: this.zoom,
        updateTransformation: this.updateTransformation,
        updateYScale: this.updateYScale,
        rescaleY: this.state.rescaleY,
        calculateDomainFromData: this.calculateDomainFromData,
      });
      heightOffset += chartHeight * c.props.heightPct;
      return c;
    });
    return (
      <svg width={width} height={this.props.height}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>{children}</g>
      </svg>
    );
  }
}

export default ChartContainer;
