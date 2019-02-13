import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Promise from 'bluebird';
import * as d3 from 'd3';
import isEqual from 'lodash.isequal';
import DataContext from '../../context/Data';
import GriffPropTypes, { seriesPropType } from '../../utils/proptypes';
import Scaler, { PLACEHOLDER_DOMAIN } from '../Scaler';

export const calculateDomainFromData = (
  data,
  accessor,
  minAccessor = null,
  maxAccessor = null
) => {
  // if there is no data, hard code the domain
  if (!data || !data.length) {
    return [-0.25, 0.25];
  }

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
  constructor(props) {
    super(props);
    const { limitTimeSubDomain, timeDomain, timeSubDomain } = props;
    this.state = {
      timeSubDomain: DataProvider.getTimeSubDomain(
        timeDomain,
        timeSubDomain,
        limitTimeSubDomain
      ),
      timeDomain,
      loaderConfig: {},
      timeDomains: {},
      timeSubDomains: {},
      xDomains: {},
      xSubDomains: {},
      yDomains: {},
      ySubDomains: {},
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Check if one of the series got removed from props
    // If so, delete the respective keys in loaderconfig
    // This is important so we don't cache the values if it gets readded later
    const { loaderConfig, yDomains, ySubDomains } = prevState;
    const { series } = nextProps;
    const seriesKeys = {};
    series.forEach(s => {
      seriesKeys[s.id] = true;
    });
    const newLoaderConfig = { ...loaderConfig };
    const newYDomains = { ...yDomains };
    const newYSubDomains = { ...ySubDomains };
    let shouldUpdate = false;
    Object.keys(loaderConfig).forEach(key => {
      if (!seriesKeys[key]) {
        // Clean up
        delete newLoaderConfig[key];
        delete newYDomains[key];
        shouldUpdate = true;
      }
    });
    if (shouldUpdate) {
      return {
        loaderConfig: newLoaderConfig,
        yDomains: newYDomains,
        ySubDomains: newYSubDomains,
      };
    }
    return null;
  }

  async componentDidMount() {
    const { series } = this.props;
    this.startUpdateInterval();
    await Promise.map(series, s => this.fetchData(s.id, 'MOUNTED'));
  }

  async componentDidUpdate(prevProps) {
    // If new series are present in prop,
    // run the fetchData lifecycle for those series
    const {
      limitTimeSubDomain,
      onTimeSubDomainChanged,
      pointsPerSeries,
      series,
      timeDomain: propsTimeDomain,
      timeSubDomain: propsTimeSubDomain,
      updateInterval,
    } = this.props;
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
    if (pointsPerSeries !== prevProps.pointsPerSeries) {
      await Promise.map(series, s =>
        this.fetchData(s.id, 'UPDATE_POINTS_PER_SERIES')
      );
    }

    const { series: prevSeries } = prevProps;
    if (!prevSeries) {
      return;
    }
    const { timeSubDomain, timeDomain } = this.state;

    if (!isEqual(propsTimeSubDomain, prevProps.timeSubDomain)) {
      this.timeSubDomainChanged(propsTimeSubDomain);
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
      if (!isEqual(timeSubDomain, timeDomain)) {
        // The series got added when zoomed in,
        // Need to also fetch a higher-granularity version on mount
        await this.fetchData(id, 'UPDATE_SUBDOMAIN');
      }
    });

    // Check if timeDomain changed in props -- if so reset state.
    if (!isEqual(propsTimeDomain, prevProps.timeDomain)) {
      const newTimeSubDomain = DataProvider.getTimeSubDomain(
        propsTimeDomain,
        propsTimeSubDomain,
        limitTimeSubDomain
      );
      // eslint-disable-next-line
      this.setState(
        {
          timeDomain: propsTimeDomain,
          timeSubDomain: newTimeSubDomain,
          loaderConfig: {},
          yDomains: {},
          ySubDomains: {},
        },
        () => {
          series.map(s => this.fetchData(s.id, 'MOUNTED'));
          if (onTimeSubDomainChanged) {
            onTimeSubDomainChanged(newTimeSubDomain);
          }
        }
      );
      this.startUpdateInterval();
    }
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  static getTimeSubDomain = (
    timeDomain,
    timeSubDomain,
    // eslint-disable-next-line no-shadow
    limitTimeSubDomain = timeSubDomain => timeSubDomain
  ) => {
    if (!timeSubDomain) {
      return timeDomain;
    }
    const newTimeSubDomain = limitTimeSubDomain(timeSubDomain);
    const timeDomainLength = timeDomain[1] - timeDomain[0];
    const timeSubDomainLength = newTimeSubDomain[1] - newTimeSubDomain[0];
    if (timeDomainLength < timeSubDomainLength) {
      return timeDomain;
    }
    if (newTimeSubDomain[0] < timeDomain[0]) {
      return [timeDomain[0], timeDomain[0] + timeSubDomainLength];
    }
    if (newTimeSubDomain[1] > timeDomain[1]) {
      return [timeDomain[1] - timeSubDomainLength, timeDomain[1]];
    }
    return newTimeSubDomain;
  };

  getSeriesObjects = () => {
    const { collections, series } = this.props;
    const collectionsById = {};
    (collections || []).forEach(c => {
      collectionsById[c.id] = c;
    });
    return series.map(s =>
      this.enrichSeries(s, collectionsById[s.collectionId || ''] || {})
    );
  };

  getSingleSeriesObject = id => {
    const { collections, series: propsSeries } = this.props;
    const series = propsSeries.find(s => id === s.id);
    if (!series) {
      throw new Error(
        `Trying to get single series object for id ${id} which is not defined in props.`
      );
    }
    return this.enrichSeries(
      series,
      series.collectionId
        ? (collections || []).find(c => series.collectionId === c.id)
        : {}
    );
  };

  startUpdateInterval = () => {
    const {
      isTimeSubDomainSticky,
      limitTimeSubDomain,
      series,
      updateInterval,
    } = this.props;
    if (updateInterval) {
      clearInterval(this.fetchInterval);
      this.fetchInterval = setInterval(() => {
        const { timeDomain, timeSubDomain } = this.state;
        const newTimeDomain = timeDomain.map(d => d + updateInterval);
        const newTimeSubDomain = isTimeSubDomainSticky
          ? DataProvider.getTimeSubDomain(
              newTimeDomain,
              timeSubDomain.map(d => d + updateInterval),
              limitTimeSubDomain
            )
          : timeSubDomain;
        this.setState(
          {
            timeDomain: newTimeDomain,
            timeSubDomain: newTimeSubDomain,
          },
          () => {
            series.map(s => this.fetchData(s.id, 'INTERVAL'));
          }
        );
      }, updateInterval);
    }
  };

  enrichSeries = (series, collection = {}) => {
    const {
      drawPoints,
      drawLines,
      opacity,
      opacityAccessor,
      pointWidth,
      pointWidthAccessor,
      strokeWidth,
      timeAccessor,
      timeDomain: propTimeDomain,
      timeSubDomain,
      xAccessor,
      x0Accessor,
      x1Accessor,
      xDomain: propXDomain,
      xSubDomain: propXSubDomain,
      y0Accessor,
      y1Accessor,
      yAccessor,
      yDomain: propYDomain,
      ySubDomain: propYSubDomain,
    } = this.props;
    const {
      loaderConfig,
      timeDomains,
      timeSubDomains,
      xDomains,
      xSubDomains,
      yDomains,
      ySubDomains,
    } = this.state;
    const yDomain =
      collection.yDomain ||
      series.yDomain ||
      propYDomain ||
      yDomains[series.id] ||
      PLACEHOLDER_DOMAIN;
    const xDomain =
      collection.xDomain ||
      series.xDomain ||
      propXDomain ||
      xDomains[series.id] ||
      PLACEHOLDER_DOMAIN;
    const timeDomain =
      collection.timeDomain ||
      series.timeDomain ||
      timeDomains[series.id] ||
      propTimeDomain ||
      PLACEHOLDER_DOMAIN;
    return {
      hidden: collection.hidden,
      data: [],
      ...deleteUndefinedFromObject(loaderConfig[series.id]),
      ...deleteUndefinedFromObject(series),
      drawPoints: firstDefined(
        (loaderConfig[series.id] || {}).drawPoints,
        series.drawPoints,
        collection.drawPoints,
        drawPoints
      ),
      drawLines: firstDefined(
        (loaderConfig[series.id] || {}).drawLines,
        series.drawLines,
        collection.drawLines,
        drawLines
      ),
      timeAccessor: firstDefined(
        series.timeAccessor,
        collection.timeAccessor,
        timeAccessor
      ),
      xAccessor: firstDefined(
        series.xAccessor,
        collection.xAccessor,
        xAccessor
      ),
      x0Accessor: firstDefined(
        series.x0Accessor,
        collection.x0Accessor,
        x0Accessor
      ),
      x1Accessor: firstDefined(
        series.x1Accessor,
        collection.x1Accessor,
        x1Accessor
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
      timeDomain,
      timeSubDomain:
        collection.timeSubDomain ||
        series.timeSubDomain ||
        timeSubDomains[series.id] ||
        timeSubDomain ||
        timeDomain,
      xDomain,
      xSubDomain:
        collection.xSubDomain ||
        series.xSubDomain ||
        propXSubDomain ||
        xSubDomains[series.id] ||
        xDomain,
      yDomain,
      ySubDomain:
        collection.ySubDomain ||
        series.ySubDomain ||
        propYSubDomain ||
        ySubDomains[series.id] ||
        yDomain,
    };
  };

  fetchData = async (id, reason) => {
    const {
      defaultLoader,
      onFetchData,
      pointsPerSeries,
      timeAccessor,
      x0Accessor,
      x1Accessor,
      xAccessor,
      y0Accessor,
      y1Accessor,
      yAccessor,
      onFetchDataError,
    } = this.props;
    const { timeDomain, timeSubDomain } = this.state;
    const seriesObject = this.getSingleSeriesObject(id);
    const loader = seriesObject.loader || defaultLoader;
    if (!loader) {
      throw new Error(`Series ${id} does not have a loader.`);
    }
    let loaderResult = {};
    try {
      loaderResult = await loader({
        id,
        timeDomain,
        timeSubDomain,
        pointsPerSeries,
        oldSeries: seriesObject,
        reason,
      });
    } catch (e) {
      onFetchDataError(e);
    }
    // This needs to happen after the loader comes back because the state can
    // change while the load function is operating. If we make a copy of the
    // state before the loader executes, then we'll trample any updates which
    // may have happened while the loader was loading.
    const { loaderConfig: originalLoaderConfig } = this.state;
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
    if (
      reason === 'MOUNTED' ||
      (seriesObject.data.length === 0 && loaderConfig.data.length > 0)
    ) {
      const {
        timeDomains,
        timeSubDomains,
        xSubDomains,
        ySubDomains,
      } = this.state;
      const calculatedTimeDomain = calculateDomainFromData(
        loaderConfig.data,
        loaderConfig.timeAccessor || timeAccessor
      );
      const calculatedTimeSubDomain = calculatedTimeDomain;
      stateUpdates.timeDomains = {
        ...timeDomains,
        [id]: calculatedTimeDomain,
      };
      stateUpdates.timeSubDomains = {
        ...timeSubDomains,
        [id]: calculatedTimeSubDomain,
      };

      const xSubDomain = calculateDomainFromData(
        loaderConfig.data,
        loaderConfig.xAccessor || xAccessor,
        loaderConfig.x0Accessor || x0Accessor,
        loaderConfig.x1Accessor || x1Accessor
      );
      stateUpdates.xSubDomains = {
        ...xSubDomains,
        [id]: xSubDomain,
      };

      const ySubDomain = calculateDomainFromData(
        loaderConfig.data,
        loaderConfig.yAccessor || yAccessor,
        loaderConfig.y0Accessor || y0Accessor,
        loaderConfig.y1Accessor || y1Accessor
      );
      stateUpdates.ySubDomains = {
        ...ySubDomains,
        [id]: ySubDomain,
      };
    }
    stateUpdates.loaderConfig = {
      ...originalLoaderConfig,
      [id]: { ...loaderConfig },
    };
    this.setState(stateUpdates, () => {
      onFetchData({ ...loaderConfig });
    });
  };

  timeSubDomainChanged = timeSubDomain => {
    const { limitTimeSubDomain, onTimeSubDomainChanged, series } = this.props;
    const { timeDomain, timeSubDomain: current } = this.state;
    const newTimeSubDomain = DataProvider.getTimeSubDomain(
      timeDomain,
      timeSubDomain,
      limitTimeSubDomain
    );
    if (isEqual(newTimeSubDomain, current)) {
      return;
    }

    clearTimeout(this.timeSubDomainChangedTimeout);
    this.timeSubDomainChangedTimeout = setTimeout(
      () => series.map(s => this.fetchData(s.id, 'UPDATE_SUBDOMAIN')),
      250
    );
    this.setState({ timeSubDomain: newTimeSubDomain }, () => {
      if (onTimeSubDomainChanged) {
        onTimeSubDomainChanged(newTimeSubDomain);
      }
    });
  };

  render() {
    const { loaderConfig, timeDomain, timeSubDomain } = this.state;
    const {
      children,
      collections,
      limitTimeSubDomain,
      timeDomain: externalTimeDomain,
      timeSubDomain: externalTimeSubDomain,
      yAxisWidth,
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
        const { yDomain: existingDomain, ySubDomain: existingYSubDomain } = acc[
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
              Math.min(existingYSubDomain[0], seriesXSubDomain[0]),
              Math.max(existingYSubDomain[1], seriesXSubDomain[1]),
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
      if (s.collectionId !== undefined) {
        const copy = {
          ...s,
        };
        if (!collectionsById[copy.collectionId]) {
          // It's pointing to a collection that doesn't exist.
          copy.collectionId = undefined;
          return copy;
        }
        copy.yDomain = [...collectionsById[copy.collectionId].yDomain];
        copy.ySubDomain = [...collectionsById[copy.collectionId].ySubDomain];
        return copy;
      }
      return s;
    });

    const context = {
      series: collectedSeries,
      collections: collectionsWithDomains,
      timeDomain,
      // This is used to signal external changes vs internal changes
      externalTimeDomain,
      timeSubDomain,
      // This is used to signal external changes vs internal changes
      externalTimeSubDomain,
      yAxisWidth,
      timeSubDomainChanged: this.timeSubDomainChanged,
      limitTimeSubDomain,
    };
    return (
      <DataContext.Provider value={context}>
        <Scaler>{children}</Scaler>
      </DataContext.Provider>
    );
  }
}

DataProvider.propTypes = {
  /**
   * A custom renderer for data points.
   *
   * @param {object} datapoint Current data point being rendered
   * @param {number} index Index of this current data point
   * @param {Array} datapoints All of the data points to be rendered
   * @param {object} metadata This object contains metadata useful for the
   * rendering process. This contains the following keys:
   *  - {@code x}: The x-position (in pixels) of the data point.
   *  - {@code x0}: The x-position (in pixels) for the data point's x0 value
   *  - {@code x1}: The x-position (in pixels) for the data point's x1 value
   *  - {@code y}: The y-position (in pixels) of the data point.
   *  - {@code y0}: The y-position (in pixels) for the data point's y0 value
   *  - {@code y1}: The y-position (in pixels) for the data point's y1 value
   *  - {@code color}: The color of this data point
   *  - {@code opacity}: The opacity of this data point
   *  - {@code opacityAccessor}: The opacity accessor for this data point
   *  - {@code pointWidth}: The width of this data point
   *  - {@code pointWidthAccessor}: The accessor for this data point's width
   *  - {@code strokeWidth}: The width of the stroke for this data point
   * @param {Array} elements This is an array of the items that Griff would
   * render for this data point. If custom rendering is not desired for this
   * data point, return this array as-is
   * @returns {(object|Array)} object(s) to render for this point.
   */
  drawPoints: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  drawLines: PropTypes.bool,
  timeDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
  timeSubDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
  xDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
  xSubDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
  updateInterval: PropTypes.number,
  timeAccessor: PropTypes.func,
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
  onTimeSubDomainChanged: PropTypes.func,
  opacity: PropTypes.number,
  /** (datapoint, index, datapoints) => number */
  opacityAccessor: PropTypes.func,

  pointWidth: PropTypes.number,
  /** (datapoint, index, datapoints) => number */
  pointWidthAccessor: PropTypes.func,
  strokeWidth: PropTypes.number,
  // if set to true and an updateInterval is provided, xSubDomain
  // will be increased at every interval (similarly to xDomain)
  isTimeSubDomainSticky: PropTypes.bool,
  // timeSubDomain => timeSubDomain
  // function to allow limitation of the value of timeSubDomain
  limitTimeSubDomain: PropTypes.func,
  // loaderConfig => void
  // called whenever data is fetched by the loader
  onFetchData: PropTypes.func,
  // error => void
  // Callback when data loader throws an error
  onFetchDataError: PropTypes.func,
};

DataProvider.defaultProps = {
  collections: [],
  defaultLoader: null,
  drawPoints: null,
  drawLines: undefined,
  onTimeSubDomainChanged: null,
  opacity: 1.0,
  opacityAccessor: null,
  pointsPerSeries: 250,
  pointWidth: null,
  pointWidthAccessor: null,
  strokeWidth: null,
  timeDomain: null,
  timeSubDomain: null,
  xDomain: null,
  xSubDomain: null,
  updateInterval: 0,
  timeAccessor: d => d.timestamp,
  x0Accessor: null,
  x1Accessor: null,
  xAccessor: d => d.timestamp,
  y0Accessor: null,
  y1Accessor: null,
  yAccessor: d => d.value,
  yAxisWidth: 50,
  yDomain: null,
  ySubDomain: null,
  isTimeSubDomainSticky: false,
  limitTimeSubDomain: xSubDomain => xSubDomain,
  onFetchData: () => {},
  // Just rethrow the error if there is no custom error handler
  onFetchDataError: e => {
    throw e;
  },
};
