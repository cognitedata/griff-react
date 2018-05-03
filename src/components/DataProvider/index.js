import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { uniq, isEqual } from 'lodash';
import Series from '../../data';

export default class DataProvider extends Component {
  state = {
    subDomain: this.props.config.baseSubdomain || this.props.config.baseDomain,
    series: this.props.config.series || {},
    contextSeries: {},
  };

  async componentDidMount() {
    await this.fetchData('MOUNTED');
    if (this.props.updateInterval) {
      this.fetchInterval = setInterval(() => {
        this.fetchData('INTERVAL');
      }, this.props.updateInterval);
    }
  }

  async componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.loader !== prevProps.loader) {
      return this.fetchData('NEW_LOADER');
    }
    const { baseDomain: domain } = this.props.config;
    const { baseDomain: oldDomain } = prevProps.config;
    if (
      domain &&
      oldDomain &&
      (domain[0] !== oldDomain[0] || domain[1] !== oldDomain[1])
    ) {
      return this.fetchData('NEW_DOMAIN');
    }
    return 1;
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
    this.unmounted = true;
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    const { series: rawSeries } = prevState;
    const { hiddenSeries, config, colors, strokeWidths } = nextProps;
    if (!rawSeries) {
      return null;
    }
    const processedSeries = {};
    Object.keys(rawSeries).forEach(key => {
      // The series config gets full precedence.
      const series = rawSeries[key];
      series.hidden = !!hiddenSeries[key];
      if (colors[key]) {
        series.color = colors[key];
      }
      if (strokeWidths[key]) {
        series.strokeWidth = strokeWidths[key];
      }
      const { yAxis, xAxis } = config;
      if (yAxis) {
        if (yAxis.staticDomain) {
          series.staticDomain = yAxis.staticDomain[key];
        }
        if (yAxis.calculateDomain && !series.calculateDomain) {
          series.calculateDomain = yAxis.calculateDomain;
        }
        if (!series.xAccessor && xAxis.accessor) {
          series.xAccessor = xAxis.accessor;
        }
        if (!series.yAccessor && yAxis.accessor) {
          series.yAccessor = yAxis.accessor;
        }
        if (!series.width && yAxis.width) {
          series.width = yAxis.width;
        }
      }
      series.width = series.width || 50;
      processedSeries[key] = series;
    });
    return { series: processedSeries };
  };

  fetchData = async reason => {
    const { hiddenSeries, config, colors, strokeWidths } = this.props;
    const rawSeries = await this.props.loader(
      config.baseDomain,
      this.state.subDomain,
      config,
      this.state.series,
      reason
    );
    const processedSeries = {};

    // Convert all of the existing random arrays into properties on the Series
    // object. This allows it to be passed around as one piece without needing
    // to refer to disconnected arrays or objects.
    Object.keys(rawSeries).forEach((key, idx) => {
      const series = new Series(rawSeries[key]);
      if (!series.color && colors && colors[key]) {
        series.color = colors[key];
      }
      if (series.hidden === undefined && hiddenSeries) {
        series.hidden = !!hiddenSeries[key];
      }
      const { yAxis, xAxis } = config;
      if (yAxis) {
        if (yAxis.staticDomain) {
          series.staticDomain = yAxis.staticDomain[key];
        }
        if (!series.calculateDomain && yAxis.calculateDomain) {
          series.calculateDomain = yAxis.calculateDomain;
        }
        if (!series.xAccessor && xAxis.accessor) {
          series.xAccessor = xAxis.accessor;
        }
        if (!series.yAccessor && yAxis.accessor) {
          series.yAccessor = yAxis.accessor;
        }
        if (!series.width && yAxis.width) {
          series.width = yAxis.width;
        }
      }
      series.width = series.width || 50;
      if (!series.strokeWidth && strokeWidths) {
        series.strokeWidth = strokeWidths[key] || 1;
      }
      processedSeries[key] = series;
    });

    const update = { series: processedSeries };
    if (reason !== 'UPDATE_SUBDOMAIN') {
      update.contextSeries = processedSeries;
    }
    if (!this.unmounted) {
      this.setState(update);
    }
  };

  subDomainChanged = async subDomain => {
    const current = this.state.subDomain;
    if (subDomain[0] === current[0] && subDomain[1] === current[1]) {
      return;
    }
    clearTimeout(this.subDomainChangedTimeout);
    this.subDomainChangedTimeout = setTimeout(async () => {
      await this.fetchData('UPDATE_SUBDOMAIN');
    }, 300);
    this.setState({ subDomain });
  };

  render() {
    const {
      width,
      height,
      margin,
      colors,
      hiddenSeries,
      annotations,
      strokeWidths,
    } = this.props;
    const { series, contextSeries } = this.state;
    const { config } = this.props;
    if (!series) {
      return null;
    }
    const children = React.Children.map(this.props.children, (child, i) => {
      const props = {
        config,
        colors,
        hiddenSeries,
        annotations,
        yAxis: config.yAxis,
        xAxis: config.xAxis,
        domain: config.baseDomain,
        subDomain: this.state.subDomain,
        series: this.state.series,
        contextSeries,
        width,
        height,
        margin,
        strokeWidths,
        subDomainChanged: this.subDomainChanged,
        key: i + 1,
      };
      return React.cloneElement(child, props);
    });
    return (
      <div width={width} height={height}>
        {children}
      </div>
    );
  }
}

DataProvider.propTypes = {
  config: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  margin: PropTypes.object,
  updateInterval: PropTypes.number,
  hiddenSeries: PropTypes.objectOf(PropTypes.bool),
  annotations: PropTypes.arrayOf(PropTypes.object),
  strokeWidths: PropTypes.objectOf(PropTypes.number),
};

DataProvider.defaultProps = {
  margin: {
    top: 20,
    left: 20,
    bottom: 0,
    right: 0,
  },
  hiddenSeries: {},
  annotations: [],
  strokeWidths: {},
};
