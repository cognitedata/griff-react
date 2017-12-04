import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { uniq } from 'lodash';

export default class DataProvider extends Component {
  state = {
    domain: this.props.config.baseDomain,
    subDomain: this.props.config.baseDomain,
    series: this.props.config.series || {}
  };

  async componentDidMount() {
    await this.fetchData('MOUNTED');
    if (this.props.updateInterval) {
      this.fetchInterval = setInterval(() => {
        this.fetchData('INTERVAL');
      }, this.props.updateInterval);
    }
  }

  shouldComponentUpdate(
    { config, loader },
    { domain: nextDomain, subDomain: nextSubdomain, series }
  ) {
    if (this.props.loader !== loader) {
      return true;
    }
    const { domain, subDomain } = this.state;
    if (
      domain[0] !== nextDomain[0] ||
      domain[1] !== nextDomain[1] ||
      subDomain[0] !== nextSubdomain[0] ||
      subDomain[1] !== nextSubdomain[1]
    ) {
      return true;
    }
    const { series: currentSeries } = this.state;
    const keys = Object.keys(series);
    const currentKeys = Object.keys(currentSeries);
    if (keys.length !== currentKeys.length) {
      return true;
    }
    const allKeys = uniq([...keys, ...currentKeys]);
    for (let i = 0; i < allKeys.length; i += 1) {
      const key = allKeys[i];
      if (!currentSeries[key] || !series[key]) {
        return true;
      }
      const oldSerie = currentSeries[key];
      const newSerie = series[key];
      if (oldSerie.data.length !== newSerie.data.length) {
        return true;
      }
      const oldData = oldSerie.data;
      const newData = newSerie.data;
      const oldXAccessor =
        oldSerie.xAccessor || this.props.config.xAxis.accessor;
      const oldYAccessor =
        oldSerie.yAccessor || this.props.config.yAxis.accessor;
      const newXAccessor = newSerie.xAccessor || config.xAxis.accessor;
      const newYAccessor = newSerie.yAccessor || config.yAxis.accessor;
      oldData.some(oldPoint => {
        const newPoint = newData[i];
        if (oldXAccessor(oldPoint) !== newXAccessor(newPoint)) {
          return true;
        }
        if (oldYAccessor(oldPoint) !== newYAccessor(newPoint)) {
          return true;
        }
        return false;
      });
      return false;
    }
    return false;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.loader !== prevProps.loader) {
      return this.fetchData('NEW_LOADER');
    }
    const { domain } = this.state;
    const { domain: oldDomain } = prevState;
    if (domain[0] !== oldDomain[0] || domain[1] !== oldDomain[1]) {
      return this.fetchData('NEW_DOMAIN');
    }
    return 1;
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  fetchData = async reason => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`ACTION: fetch_data, REASON: ${reason}`);
    }
    const series = await this.props.loader(
      this.state.domain,
      this.state.subDomain,
      this.props.config,
      this.state.series,
      reason
    );
    this.setState({
      series
    });
  };

  subDomainChanged = async subDomain => {
    const current = this.state.subDomain;
    if (subDomain[0] === current[0] && subDomain[1] === current[1]) {
      return;
    }
    clearTimeout(this.subDomainChangedTimeout);
    this.subDomainChangedTimeout = setTimeout(async () => {
      await this.fetchData('UPDATE_SUBDOMAIN');
    }, 100);
    this.setState({ subDomain });
  };

  render() {
    const { width, height, margin } = this.props;
    const { series } = this.state;
    const { config } = this.props;
    if (!series) {
      return null;
    }
    const children = React.Children.map(this.props.children, (child, i) => {
      const props = {
        yAxis: config.yAxis,
        xAxis: config.xAxis,
        domain: this.state.domain,
        subDomain: this.state.subDomain,
        series: this.state.series,
        width,
        height,
        margin,
        subDomainChanged: this.subDomainChanged,
        key: i + 1
      };
      return React.cloneElement(child, props);
    });
    return children;
  }
}

DataProvider.propTypes = {
  config: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  margin: PropTypes.object,
  updateInterval: PropTypes.number
};

DataProvider.defaultProps = {
  margin: {
    top: 20,
    left: 20,
    bottom: 0,
    right: 0
  }
};
