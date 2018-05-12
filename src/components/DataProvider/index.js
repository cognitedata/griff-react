import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { uniq, isEqual } from 'lodash';
import Validators from '../../Validators';

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

  shouldComponentUpdate(
    {
      loader,
      colors,
      config,
      children,
      width,
      height,
      hiddenSeries,
      annotations,
      strokeWidths,
    },
    { subDomain: nextSubdomain, series }
  ) {
    if (!isEqual(annotations, this.props.annotations)) {
      return true;
    }
    if (this.props.loader !== loader) {
      return true;
    }
    if (width !== this.props.width || height !== this.props.height) {
      return true;
    }
    if (!isEqual(colors, this.props.colors)) {
      return true;
    }
    if (!isEqual(hiddenSeries, this.props.hiddenSeries)) {
      return true;
    }
    if (!isEqual(this.props.strokeWidths, strokeWidths)) {
      return true;
    }
    if (
      React.Children.toArray(children).filter(child => child !== null)
        .length !==
      React.Children.toArray(this.props.children).filter(
        child => child !== null
      ).length
    ) {
      return true;
    }
    const { subDomain } = this.state;
    const { baseDomain: domain } = this.props.config;
    const { baseDomain: nextDomain } = config;
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
    if (!isEqual(config.yAxis, this.props.config.yAxis)) {
      return true;
    }
    if (config.showContext !== this.props.config.showContext) {
      return true;
    }
    if (config.zoomable !== this.props.config.zoomable) {
      return true;
    }
    const allKeys = uniq([...keys, ...currentKeys]);
    for (let i = 0; i < allKeys.length; i += 1) {
      const key = allKeys[i];
      if (!currentSeries[key] || !series[key]) {
        return true;
      }
      if (currentSeries[key].drawPoints !== series[key].drawPoints) {
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
      oldData.some((oldPoint, j) => {
        const newPoint = newData[j];
        if (oldXAccessor(oldPoint) !== newXAccessor(newPoint)) {
          return true;
        }
        if (oldYAccessor(oldPoint) !== newYAccessor(newPoint)) {
          return true;
        }
        return false;
      });
    }
    return false;
  }

  componentDidUpdate(prevProps) {
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

  fetchData = async reason => {
    const series = await this.props.loader(
      this.props.config.baseDomain,
      this.state.subDomain,
      this.props.config,
      this.state.series,
      reason
    );
    const update = {
      series,
    };
    if (reason !== 'UPDATE_SUBDOMAIN') {
      update.contextSeries = series;
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
      config,
      hiddenSeries,
      annotations,
      strokeWidths,
    } = this.props;
    const { series, contextSeries } = this.state;
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
  config: Validators.config,
  colors: PropTypes.objectOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  margin: Validators.margin,
  loader: PropTypes.func.isRequired,
  hiddenSeries: PropTypes.objectOf(PropTypes.bool),
  annotations: PropTypes.arrayOf(PropTypes.object),
  strokeWidths: PropTypes.objectOf(PropTypes.number),
  updateInterval: PropTypes.number,
};

DataProvider.defaultProps = {
  config: {},
  margin: {
    top: 20,
    left: 20,
    bottom: 0,
    right: 0,
  },
  hiddenSeries: {},
  annotations: [],
  strokeWidths: {},
  updateInterval: 0,
};
