import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Promise from 'bluebird';
import * as d3 from 'd3';
import isEqual from 'lodash.isequal';
import DataContext from '../../context/Data';
import GriffPropTypes, { seriesPropType } from '../../utils/proptypes';

const calculateDomainFromData = (
  data,
  accessor,
  y0Accessor = null,
  y1Accessor = null
) => {
  let extent;
  if (y0Accessor && y1Accessor) {
    extent = [d3.min(data, y0Accessor), d3.max(data, y1Accessor)];
  } else {
    extent = d3.extent(data, accessor);
  }
  const diff = extent[1] - extent[0];
  if (Math.abs(diff) < 1e-3) {
    if (extent[0] === 0) {
      // If 0 is the only value present in the series, hard code domain.
      return [-0.25, 0.25];
    }
    const domain = [(1 / 2) * extent[0], (3 / 2) * extent[0]];
    if (domain[1] < domain[0]) {
      return [domain[1], domain[0]];
    }
    return domain;
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

// make sure that passed subDomain is part of baseDomain
const getSubDomain = (baseDomain, subDomain) => {
  if (!subDomain) {
    return baseDomain;
  }
  const minDomain = Math.max(subDomain[0], baseDomain[0]);
  const maxDomain = Math.min(subDomain[1], baseDomain[1]);
  return [minDomain, maxDomain];
};

export default class DataProvider extends Component {
  state = {
    subDomain: getSubDomain(this.props.baseDomain, this.props.subDomain),
    baseDomain: this.props.baseDomain,
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
    this.startUpdateInterval();
  }

  async componentDidUpdate(prevProps) {
    // If new series are present in prop,
    // run the fetchData lifecycle for those series
    const { updateInterval } = this.props;
    const { updateInterval: prevUpdateInterval } = prevProps;
    if (updateInterval !== prevUpdateInterval) {
      if (prevUpdateInterval) {
        clearInterval(this.fetchInterval);
      }
      if (updateInterval) {
        this.startUpdateInterval();
      }
    }
    const { series: prevSeries } = prevProps;
    if (!prevSeries) {
      return;
    }
    const { series } = this.props;
    const { subDomain, baseDomain } = this.state;

    if (!isEqual(this.props.subDomain, prevProps.subDomain)) {
      this.subDomainChanged(this.props.subDomain);
    }

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

    // Check if basedomain changed in props -- if so reset state.
    if (!isEqual(this.props.baseDomain, prevProps.baseDomain)) {
      const newSubDomain = getSubDomain(
        this.props.baseDomain,
        this.props.subDomain
      );
      // eslint-disable-next-line
      this.setState(
        {
          baseDomain: this.props.baseDomain,
          subDomain: newSubDomain,
          loaderConfig: {},
          contextSeries: {},
          yDomains: {},
        },
        async () => {
          await Promise.map(this.props.series, s =>
            this.fetchData(s.id, 'MOUNTED')
          );
        }
      );
      if (this.props.onSubDomainChanged) {
        this.props.onSubDomainChanged(newSubDomain);
      }
      if (this.fetchInterval) {
        clearInterval(this.fetchInterval);
      }
      this.startUpdateInterval();
    }
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  getSeriesObjects = () => {
    const collectionsById = {};
    (this.props.collections || []).forEach(c => {
      collectionsById[c.id] = c;
    });
    return this.props.series.map(s =>
      this.enrichSeries(s, collectionsById[s.collectionId || ''] || {})
    );
  };

  getSingleSeriesObject = id => {
    const series = this.props.series.find(s => id === s.id);
    if (!series) {
      throw new Error(
        `Trying to get single series object for id ${id} which is not defined in props.`
      );
    }
    return this.enrichSeries(
      series,
      series.collectionId
        ? (this.props.collections || []).find(c => series.collectionId === c.id)
        : {}
    );
  };

  startUpdateInterval = () => {
    const { updateInterval } = this.props;
    if (updateInterval) {
      this.fetchInterval = setInterval(() => {
        const { baseDomain } = this.state;
        this.setState(
          {
            baseDomain: baseDomain.map(d => d + updateInterval),
          },
          () => {
            Promise.map(this.props.series, s =>
              this.fetchData(s.id, 'INTERVAL')
            );
          }
        );
      }, updateInterval);
    }
  };

  enrichSeries = (series, collection = {}) => {
    const { yAccessor, y0Accessor, y1Accessor, xAccessor } = this.props;
    const { loaderConfig, yDomains } = this.state;

    const undefinedTruthiness = (a, b, c) => {
      if (a === undefined) {
        if (b === undefined) {
          return c;
        }
        return b;
      }
      return a;
    };

    return {
      drawPoints: collection.drawPoints,
      strokeWidth: collection.strokeWidth,
      hidden: collection.hidden,
      data: [],
      ...deleteUndefinedFromObject(series),
      ...deleteUndefinedFromObject(loaderConfig[series.id]),
      xAccessor: undefinedTruthiness(
        series.xAccessor,
        collection.xAccessor,
        xAccessor
      ),
      yAccessor: undefinedTruthiness(
        series.yAccessor,
        collection.yAccessor,
        yAccessor
      ),
      y0Accessor: undefinedTruthiness(
        series.y0Accessor,
        collection.y0Accessor,
        y0Accessor
      ),
      y1Accessor: undefinedTruthiness(
        series.y1Accessor,
        collection.y1Accessor,
        y1Accessor
      ),
      yAxisDisplayMode: series.yAxisDisplayMode || collection.yAxisDisplayMode,
      yDomain: series.yDomain ||
        collection.yDomain ||
        yDomains[series.id] || [0, 0],
    };
  };

  fetchData = async (id, reason) => {
    const { pointsPerSeries, defaultLoader } = this.props;
    const { subDomain, baseDomain } = this.state;
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
      yAccessor: seriesObject.yAccessor,
      y0Accessor: seriesObject.y0Accessor,
      y1Accessor: seriesObject.y1Accessor,
    };
    const stateUpdates = {};
    if (reason === 'MOUNTED') {
      const yDomain = calculateDomainFromData(
        loaderConfig.data,
        loaderConfig.yAccessor || this.props.yAccessor,
        loaderConfig.y0Accessor || this.props.y0Accessor,
        loaderConfig.y1Accessor || this.props.y1Accessor
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
    if (this.props.onSubDomainChanged) {
      this.props.onSubDomainChanged(subDomain);
    }
    this.setState({ subDomain });
  };

  render() {
    const { loaderConfig, contextSeries, baseDomain, subDomain } = this.state;
    const {
      yAxisWidth,
      children,
      baseDomain: externalBaseDomain,
      subDomain: externalSubDomain,
      collections,
    } = this.props;
    if (Object.keys(loaderConfig).length === 0) {
      // Do not bother, loader hasn't given any data yet.
      return null;
    }
    const seriesObjects = this.getSeriesObjects();
    const context = {
      series: seriesObjects,
      collections,
      baseDomain,
      // This is used to signal external changes vs internal changes
      externalBaseDomain,
      subDomain,
      // This is used to signal external changes vs internal changes
      externalSubDomain,
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
  subDomain: PropTypes.arrayOf(PropTypes.number),
  updateInterval: PropTypes.number,
  yAccessor: PropTypes.func,
  y0Accessor: PropTypes.func,
  y1Accessor: PropTypes.func,
  xAccessor: PropTypes.func,
  yAxisWidth: PropTypes.number,
  pointsPerSeries: PropTypes.number,
  children: PropTypes.node.isRequired,
  defaultLoader: PropTypes.func,
  series: seriesPropType.isRequired,
  collections: PropTypes.arrayOf(GriffPropTypes.collection),
  // (subDomain) => null
  onSubDomainChanged: PropTypes.func,
};

DataProvider.defaultProps = {
  updateInterval: 0,
  xAccessor: d => d.timestamp,
  yAccessor: d => d.value,
  y0Accessor: null,
  y1Accessor: null,
  pointsPerSeries: 250,
  yAxisWidth: 50,
  defaultLoader: null,
  subDomain: null,
  onSubDomainChanged: null,
  collections: [],
};
