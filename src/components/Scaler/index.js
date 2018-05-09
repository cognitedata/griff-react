import React, { Component } from 'react';
import * as d3 from 'd3';

export default class Scaler extends Component {
  constructor(props) {
    super(props);
    const { height, width } = props;
    this.xZoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]]);
    this.state = {
      xTransformation: {},
      rescaleY: {},
    };
  }

  componentDidUpdate(prevProps) {
    const { width, height } = this.props;
    if (prevProps.width !== width) {
      this.xZoom
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]]);
    }
  }

  updateTransformation = s => {
    const { width } = this.props;
    this.setState({
      xTransformation: d3.zoomIdentity
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
    const { width, domain, subDomain, series } = this.props;
    const { xTransformation, rescaleY } = this.state;
    const xScale = d3
      .scaleTime()
      .domain(domain)
      .range([0, width]);
    const subDomainScale = d3
      .scaleTime()
      .domain(subDomain)
      .range([0, width]);
    Object.keys(rescaleY).forEach(key => {
      series[key].scaler = this.state.rescaleY[key];
    });
    const children = React.Children.map(this.props.children, child => {
      if (child === null) {
        // Handling the conditional rendering of children, that will render
        // false/null
        return null;
      }
      return React.cloneElement(child, {
        ...this.props,
        series,
        subDomainChanged: this.props.subDomainChanged,
        xScale,
        subDomainScale,
        xTransformation,
        updateYScale: this.updateYScale,
        updateTransformation: this.updateTransformation,
        zoom: this.xZoom,
      });
    });
    return children;
  }
}
