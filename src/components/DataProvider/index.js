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

  async componentDidMount() {
    await Promise.map(this.props.series, s => this.fetchData(s.id, 'MOUNTED'));
    if (this.props.updateInterval) {
      this.fetchInterval = setInterval(() => {
        Promise.map(this.props.series, s => this.fetchData(s.id, 'INTERVAL'));
      }, this.props.updateInterval);
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    const { series: prevSeries } = prevState;
    if (!prevSeries) {
      return;
    }
    const { series, baseDomain } = this.props;
    const { subDomain } = this.state;
    const prevSeriesKeys = {};
    prevSeries.forEach(p => {
      prevSeriesKeys[p.id] = true;
    });
    const newSeries = series.filter(s => prevSeries[s.id] === true);
    await Promise.map(newSeries, async ({ id }) => {
      await this.fetchData(id, 'MOUNTED');
      if (!isEqual(subDomain, baseDomain)) {
        await this.fetchData(id, 'UPDATE_SUBDOMAIN');
      }
    });
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
    this.unmounted = true;
  }

  getSeriesObjects = () => {
    const { series, yAccessor, xAccessor } = this.props;
    const { loaderConfig, yDomains } = this.state;

    return series.map(s => ({
      data: [],
      ...deleteUndefinedFromObject(s),
      ...deleteUndefinedFromObject(loaderConfig[s.id]),
      yAccessor: s.yAccessor || yAccessor,
      xAccessor: s.xAccessor || xAccessor,
      yDomain: s.yDomain ? s.yDomain : yDomains[s.id],
    }));
  };

  getSingleSeriesObject = id => {
    const { yAccessor, xAccessor } = this.props;
    const { loaderConfig, yDomains } = this.state;
    const series = this.props.series.find(s => id === s.id);
    if (!series) {
      throw new Error(
        `Trying to get single series object for id ${id} which is not defined in props.`
      );
    }
    return {
      data: [],
      ...deleteUndefinedFromObject(series),
      ...deleteUndefinedFromObject(loaderConfig[id]),
      xAccessor: series.xAccessor || xAccessor,
      yAccessor: series.yAccessor || yAccessor,
      yDomain: series.yDomain || yDomains[id],
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
    const loaderConfig = {
      data: [],
      id,
      ...loaderResult,
      reason,
    };
    const stateUpdates = {};
    if (reason === 'MOUNTED') {
      const yDomain = calculateDomainFromData(
        loaderConfig.data,
        loaderConfig.yAccessor || this.props.yAccessor
      );
      stateUpdates.yDomains = {
        ...this.state.yDomains,
        [id]: yDomain,
      };
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
      subDomain: subDomain || baseDomain,
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
