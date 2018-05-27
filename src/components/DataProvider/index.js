import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Promise from 'bluebird';
import * as d3 from 'd3';
import isEqual from 'lodash.isequal';
import DataContext from '../../context/Data';
import { seriesPropType } from '../../utils/proptypes';

const calculateDomainFromData = (data, accessor) => {
  const extent = d3.extent(data, accessor);
  const diff = extent[1] - extent[0];
  if (Math.abs(diff) < 1e-3) {
    return [1 / 2 * extent[0], 3 / 2 * extent[0]];
  }
  return [extent[0] - diff * 0.025, extent[1] + diff * 0.025];
};

const deleteUndefinedFromObject = obj => {
  if (!obj) {
    return {};
  }
  const newObject = {};
  Object.keys(obj).forEach(k => {
    if (obj[k] !== undefined) {
      newObject[k] = obj[k];
    }
  });
  return newObject;
};

export default class DataProvider extends Component {
  state = {
    subDomain: this.props.baseDomain,
    loaderConfig: {},
    contextSeries: {},
    yDomains: {},
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    // Check if one of the series got removed from props
    // If so, delete the respective keys in contextSeries and loaderconfig
    // This is important so we don't cache the vales if it gets readded later
    const { loaderConfig, contextSeries, yDomains } = prevState;
    const { series } = nextProps;
    const seriesKeys = {};
    series.forEach(s => {
      seriesKeys[s.id] = true;
    });
    const newContextSeries = { ...contextSeries };
    const newLoaderConfig = { ...loaderConfig };
    const newYDomains = { ...yDomains };
    let shouldUpdate = false;
    Object.keys(loaderConfig).forEach(key => {
      if (!seriesKeys[key]) {
        // Clean up
        delete newContextSeries[key];
        delete newLoaderConfig[key];
        delete newYDomains[key];
        shouldUpdate = true;
      }
    });
    if (shouldUpdate) {
      return {
        loaderConfig: newLoaderConfig,
        contextSeries: newContextSeries,
        yDomains: newYDomains,
      };
    }
    return null;
  }

  async componentDidMount() {
    await Promise.map(this.props.series, s => this.fetchData(s.id, 'MOUNTED'));
    if (this.props.updateInterval) {
      this.fetchInterval = setInterval(() => {
        Promise.map(this.props.series, s => this.fetchData(s.id, 'INTERVAL'));
      }, this.props.updateInterval);
    }
  }

  async componentDidUpdate(prevProps) {
    // If new series are present in prop,
    // run the fetchData lifecycle for those series
    const { series: prevSeries } = prevProps;
    if (!prevSeries) {
      return;
    }
    const { series, baseDomain } = this.props;
    const { subDomain } = this.state;

    const currentSeriesKeys = {};
    series.forEach(s => {
      currentSeriesKeys[s.id] = true;
    });
    const prevSeriesKeys = {};
    prevSeries.forEach(p => {
      prevSeriesKeys[p.id] = true;
    });
    const newSeries = series.filter(s => prevSeriesKeys[s.id] !== true);
    await Promise.map(newSeries, async ({ id }) => {
      await this.fetchData(id, 'MOUNTED');
      if (!isEqual(subDomain, baseDomain)) {
        // The series got added when zoomed in,
        // Need to also fetch a higher-granularity version on mount
        await this.fetchData(id, 'UPDATE_SUBDOMAIN');
      }
    });
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
    this.unmounted = true;
  }

  getSeriesObjects = () => this.props.series.map(this.enrichSeries);

  getSingleSeriesObject = id => {
    const series = this.props.series.find(s => id === s.id);
    if (!series) {
      throw new Error(
        `Trying to get single series object for id ${id} which is not defined in props.`
      );
    }
    return this.enrichSeries(series);
  };

  enrichSeries = series => {
    const { yAccessor, xAccessor } = this.props;
    const { loaderConfig, yDomains } = this.state;
    return {
      data: [],
      ...deleteUndefinedFromObject(series),
      ...deleteUndefinedFromObject(loaderConfig[series.id]),
      xAccessor: series.xAccessor || xAccessor,
      yAccessor: series.yAccessor || yAccessor,
      yDomain: series.yDomain || yDomains[series.id] || [0, 0],
    };
  };

  fetchData = async (id, reason) => {
    const { baseDomain, pointsPerSeries, defaultLoader } = this.props;
    const { subDomain } = this.state;
    const seriesObject = this.getSingleSeriesObject(id);
    const loader = seriesObject.loader || defaultLoader;
    if (!loader) {
      throw new Error(`Series ${id} does not have a loader.`);
    }
    const loaderResult = await loader({
      id,
      baseDomain,
      subDomain,
      pointsPerSeries,
      oldSeries: seriesObject,
      reason,
    });
    const loaderConfig = { data: [], id, ...loaderResult, reason };
    const stateUpdates = {};
    if (reason === 'MOUNTED') {
      const yDomain = calculateDomainFromData(
        loaderConfig.data,
        loaderConfig.yAccessor || this.props.yAccessor
      );
      stateUpdates.yDomains = { ...this.state.yDomains, [id]: yDomain };
    }
    stateUpdates.loaderConfig = {
      ...this.state.loaderConfig,
      [id]: { ...loaderConfig },
    };
    if (reason !== 'UPDATE_SUBDOMAIN') {
      stateUpdates.contextSeries = {
        ...this.state.contextSeries,
        [id]: { ...loaderConfig },
      };
    }
    this.setState(stateUpdates);
  };

  subDomainChanged = subDomain => {
    const current = this.state.subDomain;
    if (subDomain[0] === current[0] && subDomain[1] === current[1]) {
      return;
    }
    clearTimeout(this.subDomainChangedTimeout);
    this.subDomainChangedTimeout = setTimeout(
      () =>
        Promise.map(this.props.series, s =>
          this.fetchData(s.id, 'UPDATE_SUBDOMAIN')
        ),
      250
    );
    this.setState({ subDomain });
  };

  render() {
    const { loaderConfig, contextSeries, subDomain } = this.state;
    const { baseDomain, yAxisWidth, children } = this.props;
    if (Object.keys(loaderConfig).length === 0) {
      // Do not bother, loader hasn't given any data yet.
      return null;
    }
    const seriesObjects = this.getSeriesObjects();
    const context = {
      series: seriesObjects,
      baseDomain,
      subDomain,
      yAxisWidth,
      subDomainChanged: this.subDomainChanged,
      contextSeries: seriesObjects.map(s => ({
        ...contextSeries[s.id],
        ...s,
        drawPoints: false,
        data: (contextSeries[s.id] || { data: [] }).data,
      })),
    };
    return (
      <DataContext.Provider value={context}>{children}</DataContext.Provider>
    );
  }
}

DataProvider.propTypes = {
  baseDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
  updateInterval: PropTypes.number,
  yAccessor: PropTypes.func,
  xAccessor: PropTypes.func,
  yAxisWidth: PropTypes.number,
  pointsPerSeries: PropTypes.number,
  children: PropTypes.node.isRequired,
  defaultLoader: PropTypes.func,
  series: seriesPropType.isRequired,
};

DataProvider.defaultProps = {
  updateInterval: 0,
  xAccessor: d => d.timestamp,
  yAccessor: d => d.value,
  pointsPerSeries: 250,
  yAxisWidth: 50,
  defaultLoader: null,
};
