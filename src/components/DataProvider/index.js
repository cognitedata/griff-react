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
  minAccessor = null,
  maxAccessor = null
) => {
  let extent;
  if (minAccessor && maxAccessor) {
    extent = [d3.min(data, minAccessor), d3.max(data, maxAccessor)];
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

/**
 * Return the first thing which is not `undefined`.
 * @param {*} first
 * @param  {...any} others
 */
const firstDefined = (first, ...others) => {
  if (first !== undefined || others.length === 0) {
    return first;
  }
  return firstDefined(others[0], ...others.splice(1));
};

export default class DataProvider extends Component {
  state = {
    xSubDomain: DataProvider.getXSubDomain(
      this.props.xDomain,
      this.props.xSubDomain
    ),
    xDomain: this.props.xDomain,
    loaderConfig: {},
    contextSeries: {},
    yDomains: {},
    ySubDomains: {},
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    // Check if one of the series got removed from props
    // If so, delete the respective keys in contextSeries and loaderconfig
    // This is important so we don't cache the vales if it gets readded later
    const { loaderConfig, contextSeries, yDomains, ySubDomains } = prevState;
    const { series } = nextProps;
    const seriesKeys = {};
    series.forEach(s => {
      seriesKeys[s.id] = true;
    });
    const newContextSeries = { ...contextSeries };
    const newLoaderConfig = { ...loaderConfig };
    const newYDomains = { ...yDomains };
    const newYSubDomains = { ...ySubDomains };
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
        ySubDomains: newYSubDomains,
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

    // check if pointsPerSeries changed in props -- if so fetch new data
    if (this.props.pointsPerSeries !== prevProps.pointsPerSeries) {
      await Promise.map(this.props.series, s =>
        this.fetchData(s.id, 'UPDATE_POINTS_PER_SERIES')
      );
    }

    const { series: prevSeries } = prevProps;
    if (!prevSeries) {
      return;
    }
    const { series } = this.props;
    const { xSubDomain, xDomain } = this.state;

    if (!isEqual(this.props.xSubDomain, prevProps.xSubDomain)) {
      this.xSubDomainChanged(this.props.xSubDomain);
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
      if (!isEqual(xSubDomain, xDomain)) {
        // The series got added when zoomed in,
        // Need to also fetch a higher-granularity version on mount
        await this.fetchData(id, 'UPDATE_SUBDOMAIN');
      }
    });

    // Check if xDomain changed in props -- if so reset state.
    if (!isEqual(this.props.xDomain, prevProps.xDomain)) {
      const newXSubDomain = DataProvider.getXSubDomain(
        this.props.xDomain,
        this.props.xSubDomain
      );
      // eslint-disable-next-line
      this.setState(
        {
          xDomain: this.props.xDomain,
          xSubDomain: newXSubDomain,
          loaderConfig: {},
          contextSeries: {},
          yDomains: {},
          ySubDomains: {},
        },
        async () => {
          await Promise.map(this.props.series, s =>
            this.fetchData(s.id, 'MOUNTED')
          );
        }
      );
      if (this.props.onXSubDomainChanged) {
        this.props.onXSubDomainChanged(newXSubDomain);
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

  static getXSubDomain = (xDomain, xSubDomain) => {
    if (!xSubDomain) {
      return xDomain;
    }
    const xDomainLength = xDomain[1] - xDomain[0];
    const xSubDomainLength = xSubDomain[1] - xSubDomain[0];
    if (xDomainLength < xSubDomainLength) {
      return xDomain;
    }
    if (xSubDomain[0] < xDomain[0]) {
      return [xDomain[0], xDomain[0] + xSubDomainLength];
    }
    if (xSubDomain[1] > xDomain[1]) {
      return [xDomain[1] - xSubDomainLength, xDomain[1]];
    }
    return xSubDomain;
  };

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
        const { xDomain, xSubDomain } = this.state;
        this.setState(
          {
            xDomain: xDomain.map(d => d + updateInterval),
            xSubDomain: this.props.isXSubDomainSticky
              ? xSubDomain.map(d => d + updateInterval)
              : xSubDomain,
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
    const {
      opacity,
      opacityAccessor,
      pointWidth,
      pointWidthAccessor,
      strokeWidth,
      xAccessor,
      y0Accessor,
      y1Accessor,
      yAccessor,
      yDomain: propYDomain,
      ySubDomain,
    } = this.props;
    const { loaderConfig, yDomains, ySubDomains } = this.state;
    const yDomain = collection.yDomain ||
      series.yDomain ||
      propYDomain ||
      yDomains[series.id] || [0, 0];
    return {
      drawPoints: collection.drawPoints,
      hidden: collection.hidden,
      data: [],
      ...deleteUndefinedFromObject(loaderConfig[series.id]),
      ...deleteUndefinedFromObject(series),
      xAccessor: firstDefined(
        series.xAccessor,
        collection.xAccessor,
        xAccessor
      ),
      yAccessor: firstDefined(
        series.yAccessor,
        collection.yAccessor,
        yAccessor
      ),
      y0Accessor: firstDefined(
        series.y0Accessor,
        collection.y0Accessor,
        y0Accessor
      ),
      y1Accessor: firstDefined(
        series.y1Accessor,
        collection.y1Accessor,
        y1Accessor
      ),
      strokeWidth: firstDefined(
        series.strokeWidth,
        collection.strokeWidth,
        strokeWidth
      ),
      pointWidth: firstDefined(
        series.pointWidth,
        collection.pointWidth,
        pointWidth
      ),
      pointWidthAccessor: firstDefined(
        series.pointWidthAccessor,
        collection.pointWidthAccessor,
        pointWidthAccessor
      ),
      opacity: firstDefined(series.opacity, collection.opacity, opacity),
      opacityAccessor: firstDefined(
        series.opacityAccessor,
        collection.opacityAccessor,
        opacityAccessor
      ),
      yAxisDisplayMode:
        (series.collectionId
          ? collection.yAxisDisplayMode
          : series.yAxisDisplayMode) || collection.yAxisDisplayMode,
      yDomain,
      ySubDomain:
        collection.ySubDomain ||
        series.ySubDomain ||
        ySubDomains[series.id] ||
        ySubDomain ||
        yDomain,
    };
  };

  fetchData = async (id, reason) => {
    const { pointsPerSeries, defaultLoader } = this.props;
    const { xSubDomain, xDomain } = this.state;
    const seriesObject = this.getSingleSeriesObject(id);
    const loader = seriesObject.loader || defaultLoader;
    if (!loader) {
      throw new Error(`Series ${id} does not have a loader.`);
    }
    const loaderResult = await loader({
      id,
      xDomain,
      xSubDomain,
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
      if (!this.props.xDomain) {
        // We were not given an xDomain, so we need to calculate one based on
        // the loaded data.
        const calculatedXDomain = calculateDomainFromData(
          loaderConfig.data,
          loaderConfig.xAccessor || this.props.xAccessor,
          loaderConfig.x0Accessor || this.props.x0Accessor,
          loaderConfig.x1Accessor || this.props.x1Accessor
        );
        // The calculated xDomain needs to be big enough to encompass all of
        // the data, so they're all going to be merged.
        const mergedXDomain = [
          Math.min(calculatedXDomain[0], (xDomain || [0])[0]),
          Math.max(calculatedXDomain[1], (xDomain || [0, 0])[1]),
        ];
        stateUpdates.xDomain = mergedXDomain;
        stateUpdates.xSubDomain = mergedXDomain;
      }

      const yDomain = calculateDomainFromData(
        loaderConfig.data,
        loaderConfig.yAccessor || this.props.yAccessor,
        loaderConfig.y0Accessor || this.props.y0Accessor,
        loaderConfig.y1Accessor || this.props.y1Accessor
      );
      const ySubDomain = yDomain;
      stateUpdates.yDomains = { ...this.state.yDomains, [id]: yDomain };
      stateUpdates.ySubDomain = { ...this.state.ySubDomains, [id]: ySubDomain };
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

  xSubDomainChanged = xSubDomain => {
    const current = this.state.xSubDomain;
    const newXSubDomain = this.props.limitXSubDomain
      ? this.props.limitXSubDomain(xSubDomain)
      : xSubDomain;

    if (newXSubDomain[0] === current[0] && newXSubDomain[1] === current[1]) {
      return;
    }

    clearTimeout(this.xSubDomainChangedTimeout);
    this.xSubDomainChangedTimeout = setTimeout(
      () =>
        Promise.map(this.props.series, s =>
          this.fetchData(s.id, 'UPDATE_SUBDOMAIN')
        ),
      250
    );
    if (this.props.onXSubDomainChanged) {
      this.props.onXSubDomainChanged(newXSubDomain);
    }
    this.setState({ xSubDomain: newXSubDomain });
  };

  render() {
    const { loaderConfig, contextSeries, xDomain, xSubDomain } = this.state;
    const {
      yAxisWidth,
      children,
      xDomain: externalXDomain,
      xSubDomain: externalXSubDomain,
      collections,
    } = this.props;

    if (Object.keys(loaderConfig).length === 0) {
      // Do not bother, loader hasn't given any data yet.
      return null;
    }
    const seriesObjects = this.getSeriesObjects();

    // Compute the domains for all of the collections with one pass over all of
    // the series objects.
    const collectionDomains = seriesObjects.reduce(
      (
        acc,
        { collectionId, yDomain: seriesDomain, ySubDomain: seriesXSubDomain }
      ) => {
        if (!collectionId) {
          return acc;
        }
        const { yDomain: existingDomain, ySubDomain: existingXSubDomain } = acc[
          collectionId
        ] || {
          yDomain: [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
          ySubDomain: [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
        };
        return {
          ...acc,
          [collectionId]: {
            yDomain: [
              Math.min(existingDomain[0], seriesDomain[0]),
              Math.max(existingDomain[1], seriesDomain[1]),
            ],
            ySubDomain: [
              Math.min(existingXSubDomain[0], seriesXSubDomain[0]),
              Math.max(existingXSubDomain[1], seriesXSubDomain[1]),
            ],
          },
        };
      },
      {}
    );

    // Then we want to enrich the collection objects with their above-computed
    // domains.
    const collectionsById = {};
    const collectionsWithDomains = [];
    collections.forEach(c => {
      if (collectionDomains[c.id]) {
        const withDomain = {
          ...c,
          ...collectionDomains[c.id],
        };
        collectionsWithDomains.push(withDomain);
        collectionsById[c.id] = withDomain;
      }
    });

    // Then take a final pass over all of the series and replace their
    // yDomain and ySubDomain arrays with the one from their collections (if
    // they're a member of a collection).
    const collectedSeries = seriesObjects.map(s => {
      const copy = {
        ...s,
      };
      if (copy.collectionId !== undefined) {
        if (!collectionsById[copy.collectionId]) {
          // It's pointing to a collection that doesn't exist.
          copy.collectionId = undefined;
          return copy;
        }
        copy.yDomain = [...collectionsById[copy.collectionId].yDomain];
        copy.ySubDomain = [...collectionsById[copy.collectionId].ySubDomain];
      }
      return copy;
    });

    const context = {
      series: collectedSeries,
      collections: collectionsWithDomains,
      xDomain,
      // This is used to signal external changes vs internal changes
      externalXDomain,
      xSubDomain,
      // This is used to signal external changes vs internal changes
      externalXSubDomain,
      yAxisWidth,
      xSubDomainChanged: this.xSubDomainChanged,
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
  xDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
  xSubDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
  updateInterval: PropTypes.number,
  xAccessor: PropTypes.func,
  x0Accessor: PropTypes.func,
  x1Accessor: PropTypes.func,
  yAccessor: PropTypes.func,
  y0Accessor: PropTypes.func,
  y1Accessor: PropTypes.func,
  yAxisWidth: PropTypes.number,
  yDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
  ySubDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
  pointsPerSeries: PropTypes.number,
  children: PropTypes.node.isRequired,
  defaultLoader: PropTypes.func,
  series: seriesPropType.isRequired,
  collections: GriffPropTypes.collections,
  // xSubDomain => void
  onXSubDomainChanged: PropTypes.func,
  opacity: PropTypes.number,
  opacityAccessor: PropTypes.func,
  pointWidth: PropTypes.number,
  pointWidthAccessor: PropTypes.func,
  strokeWidth: PropTypes.number,
  isXSubDomainSticky: PropTypes.bool,
  limitXSubDomain: PropTypes.func,
};

DataProvider.defaultProps = {
  collections: [],
  defaultLoader: null,
  onXSubDomainChanged: null,
  opacity: 1.0,
  opacityAccessor: null,
  pointsPerSeries: 250,
  pointWidth: null,
  pointWidthAccessor: null,
  strokeWidth: null,
  xDomain: null,
  xSubDomain: null,
  updateInterval: 0,
  x0Accessor: null,
  x1Accessor: null,
  xAccessor: d => d.timestamp,
  y0Accessor: null,
  y1Accessor: null,
  yAccessor: d => d.value,
  yAxisWidth: 50,
  yDomain: null,
  ySubDomain: null,
  isXSubDomainSticky: false,
  limitXSubDomain: null,
};
