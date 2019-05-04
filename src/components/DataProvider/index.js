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
  return Object.keys(obj).reduce((acc, k) => {
    if (obj[k] !== undefined) {
      return { ...acc, [k]: obj[k] };
    }
    return acc;
  }, {});
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

const DEFAULT_ACCESSORS = {
  time: d => d.timestamp,
  x: d => d.x,
  y: d => d.value,
};

const DEFAULT_SERIES_CONFIG = {
  color: 'black',
  data: [],
  hidden: false,
  drawPoints: false,
  timeAccessor: DEFAULT_ACCESSORS.time,
  xAccessor: DEFAULT_ACCESSORS.x,
  yAccessor: DEFAULT_ACCESSORS.y,
  timeDomain: PLACEHOLDER_DOMAIN,
  timeSubDomain: PLACEHOLDER_DOMAIN,
  xDomain: PLACEHOLDER_DOMAIN,
  xSubDomain: PLACEHOLDER_DOMAIN,
  yDomain: PLACEHOLDER_DOMAIN,
  ySubDomain: PLACEHOLDER_DOMAIN,
  pointWidth: 6,
  strokeWidth: 1,
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
      collectionsById: {},
      seriesById: {},
    };
  }

  // static getDerivedStateFromProps(nextProps, prevState) {
  // // Check if one of the series got removed from props
  // // If so, delete the respective keys in loaderconfig
  // // This is important so we don't cache the values if it gets readded later
  // const { loaderConfig, yDomains, ySubDomains } = prevState;
  // const { series } = nextProps;
  // const seriesKeys = {};
  // series.forEach(s => {
  //   seriesKeys[s.id] = true;
  // });
  // const newLoaderConfig = { ...loaderConfig };
  // const newYDomains = { ...yDomains };
  // const newYSubDomains = { ...ySubDomains };
  // let shouldUpdate = false;
  // Object.keys(loaderConfig).forEach(key => {
  //   if (!seriesKeys[key]) {
  //     // Clean up
  //     delete newLoaderConfig[key];
  //     delete newYDomains[key];
  //     shouldUpdate = true;
  //   }
  // });
  // if (shouldUpdate) {
  //   return {
  //     loaderConfig: newLoaderConfig,
  //     yDomains: newYDomains,
  //     ySubDomains: newYSubDomains,
  //   };
  // }
  // return null;
  // }

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
    const { timeAccessor, xAccessor, yAccessor } = this.props;
    const { collectionsById, seriesById } = this.state;
    return Object.keys(seriesById).reduce((acc, id) => {
      const series = seriesById[id];
      const collection =
        series.collectionId !== undefined
          ? collectionsById[series.collectionId] || {}
          : {};
      const completedSeries = {
        ...DEFAULT_SERIES_CONFIG,
        timeAccessor,
        xAccessor,
        yAccessor,
        ...collection,
        ...series,
      };
      return [...acc, completedSeries];
    }, []);
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
    const { timeDomain, timeSubDomain, seriesById } = this.state;
    const seriesObject = seriesById[id];
    if (!seriesObject) {
      return;
    }
    const loader = seriesObject.loader || defaultLoader;
    if (!loader) {
      throw new Error(`Series ${id} does not have a loader.`);
    }
    let loaderResult = {};
    const params = {
      id,
      timeDomain,
      timeSubDomain,
      pointsPerSeries,
      oldSeries: seriesObject,
      reason,
    };
    try {
      loaderResult = await loader(params);
    } catch (e) {
      onFetchDataError(e, params);
    }

    this.setState(
      ({ seriesById: { [id]: freshSeries }, seriesById: freshSeriesById }) => {
        const series = {
          ...freshSeries,
          ...loaderResult,
        };

        if (
          // We couldn't have any data before
          reason === 'MOUNTED' ||
          // Or we didn't have data before, but do now!
          (freshSeries.data.length === 0 && loaderResult.data.length > 0)
        ) {
          series.timeDomain =
            series.timeDomain ||
            calculateDomainFromData(
              series.data,
              series.timeAccessor || timeAccessor || DEFAULT_ACCESSORS.time
            );
          series.xSubDomain =
            series.xSubDomain ||
            calculateDomainFromData(
              series.data,
              series.xAccessor || xAccessor || DEFAULT_ACCESSORS.x,
              series.x0Accessor || x0Accessor,
              series.x1Accessor || x1Accessor
            );
          series.ySubDomain =
            series.ySubDomain ||
            calculateDomainFromData(
              series.data,
              series.yAccessor || yAccessor || DEFAULT_ACCESSORS.y,
              series.y0Accessor || y0Accessor,
              series.y1Accessor || y1Accessor
            );

          series.timeSubDomain = series.timeSubDomain || series.timeDomain;
        }

        return {
          seriesById: {
            ...freshSeriesById,
            [id]: series,
          },
        };
      },
      () => {
        const {
          seriesById: { [id]: series },
        } = this.state;
        onFetchData({ ...series });
      }
    );
    // // This needs to happen after the loader comes back because the state can
    // // change while the load function is operating. If we make a copy of the
    // // state before the loader executes, then we'll trample any updates which
    // // may have happened while the loader was loading.
    // const stateUpdates = {};
    // if (
    //   reason === 'MOUNTED' ||
    //   (seriesObject.data.length === 0 && loaderConfig.data.length > 0)
    // ) {
    //   const {
    //     timeDomains,
    //     timeSubDomains,
    //     xSubDomains,
    //     ySubDomains,
    //   } = this.state;
    //   const calculatedTimeDomain = calculateDomainFromData(
    //     loaderConfig.data,
    //     loaderConfig.timeAccessor || timeAccessor
    //   );
    //   const calculatedTimeSubDomain = calculatedTimeDomain;
    //   stateUpdates.timeDomains = {
    //     ...timeDomains,
    //     [id]: calculatedTimeDomain,
    //   };
    //   stateUpdates.timeSubDomains = {
    //     ...timeSubDomains,
    //     [id]: calculatedTimeSubDomain,
    //   };

    //   const xSubDomain = calculateDomainFromData(
    //     loaderConfig.data,
    //     loaderConfig.xAccessor || xAccessor,
    //     loaderConfig.x0Accessor || x0Accessor,
    //     loaderConfig.x1Accessor || x1Accessor
    //   );
    //   stateUpdates.xSubDomains = {
    //     ...xSubDomains,
    //     [id]: xSubDomain,
    //   };

    //   const ySubDomain = calculateDomainFromData(
    //     loaderConfig.data,
    //     loaderConfig.yAccessor || yAccessor,
    //     loaderConfig.y0Accessor || y0Accessor,
    //     loaderConfig.y1Accessor || y1Accessor
    //   );
    //   stateUpdates.ySubDomains = {
    //     ...ySubDomains,
    //     [id]: ySubDomain,
    //   };
    // }
    // stateUpdates.loaderConfig = {
    //   ...originalLoaderConfig,
    //   [id]: { ...loaderConfig },
    // };
    // this.setState(stateUpdates, () => {
    //   onFetchData({ ...loaderConfig });
    // });
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

  registerCollection = ({ id, ...collection }) => {
    this.setState(({ collectionsById }) => ({
      collectionsById: {
        ...collectionsById,
        [id]: deleteUndefinedFromObject({
          ...collection,
          id,
        }),
      },
    }));

    // Return an unregistration so that we can do some cleanup.
    return () => {
      this.setState(({ collectionsById }) => {
        const copy = { ...collectionsById };
        delete copy[id];
        return {
          collectionsById: copy,
        };
      });
    };
  };

  updateCollection = ({ id, ...collection }) => {
    this.setState(({ collectionsById }) => ({
      collectionsById: {
        ...collectionsById,
        [id]: deleteUndefinedFromObject({
          ...collectionsById[id],
          ...collection,
          id,
        }),
      },
    }));
  };

  registerSeries = ({ id, ...series }) => {
    this.setState(
      ({ seriesById }) => ({
        seriesById: {
          ...seriesById,
          [id]: deleteUndefinedFromObject({
            ...series,
            id,
          }),
        },
      }),
      () => {
        this.fetchData(id, 'MOUNTED');
      }
    );

    // Return an unregistration so that we can do some cleanup.
    return () => {
      this.setState(({ seriesById }) => {
        const copy = { ...seriesById };
        delete copy[id];
        return {
          seriesById: copy,
        };
      });
    };
  };

  updateSeries = ({ id, ...series }) => {
    this.setState(({ seriesById }) => ({
      seriesById: {
        ...seriesById,
        [id]: deleteUndefinedFromObject({
          ...seriesById[id],
          // We need to strip undefined fields here so that we don't clobber
          // calculated fields from seriesById[id] (such as domains/subdomains).
          // If they want to explicitly reset a property to the default, they
          // will need to set it to null.
          ...deleteUndefinedFromObject(series),
          id,
        }),
      },
    }));
  };

  render() {
    const { collectionsById, timeDomain, timeSubDomain } = this.state;
    const {
      children,
      limitTimeSubDomain,
      timeDomain: externalTimeDomain,
      timeSubDomain: externalTimeSubDomain,
      yAxisWidth,
      onUpdateDomains,
    } = this.props;

    const seriesObjects = this.getSeriesObjects();

    // Compute the domains for all of the collections with one pass over all of
    // the series objects.
    const collectionDomains = seriesObjects.reduce(
      (
        acc,
        {
          collectionId,
          timeDomain: seriesTimeDomain,
          timeSubDomain: seriesTimeSubDomain,
          yDomain: seriesYDomain,
          ySubDomain: seriesYSubDomain,
        }
      ) => {
        if (!collectionId) {
          return acc;
        }
        const {
          timeDomain: existingTimeDomain,
          timeSubDomain: existingTimeSubDomain,
          yDomain: existingYDomain,
          ySubDomain: existingYSubDomain,
        } = acc[collectionId] || {
          timeDomain: [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
          timeSubDomain: [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
          yDomain: [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
          ySubDomain: [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
        };
        return {
          ...acc,
          [collectionId]: {
            timeDomain: [
              Math.min(existingTimeDomain[0], seriesTimeDomain[0]),
              Math.max(existingTimeDomain[1], seriesTimeDomain[1]),
            ],
            timeSubDomain: [
              Math.min(existingTimeSubDomain[0], seriesTimeSubDomain[0]),
              Math.max(existingTimeSubDomain[1], seriesTimeSubDomain[1]),
            ],
            yDomain: [
              Math.min(existingYDomain[0], seriesYDomain[0]),
              Math.max(existingYDomain[1], seriesYDomain[1]),
            ],
            ySubDomain: [
              Math.min(existingYSubDomain[0], seriesYSubDomain[0]),
              Math.max(existingYSubDomain[1], seriesYSubDomain[1]),
            ],
          },
        };
      },
      {}
    );

    // Then we want to enrich the collection objects with their above-computed
    // domains.
    const collectionsWithDomains = Object.keys(collectionsById).reduce(
      (acc, id) => {
        if (!collectionDomains[id]) {
          return acc;
        }
        return [
          ...acc,
          {
            ...collectionsById[id],
            ...collectionDomains[id],
          },
        ];
      },
      []
    );

    // Then take a final pass over all of the series and replace their
    // yDomain and ySubDomain arrays with the one from their collections (if
    // they're a member of a collection).
    const collectedSeries = seriesObjects.map(s => {
      const { collectionId } = s;
      if (collectionId === undefined) {
        return s;
      }
      const copy = { ...s };
      if (!collectionsById[collectionId]) {
        // It's pointing to a collection that doesn't exist.
        delete copy.collectionId;
      } else {
        copy.timeDomain = [...collectionDomains[collectionId].timeDomain];
        copy.timeSubDomain = [...collectionDomains[collectionId].timeSubDomain];
        copy.yDomain = [...collectionDomains[collectionId].yDomain];
        copy.ySubDomain = [...collectionDomains[collectionId].ySubDomain];
      }
      return copy;
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
      onUpdateDomains,
      registerCollection: this.registerCollection,
      updateCollection: this.updateCollection,
      registerSeries: this.registerSeries,
      updateSeries: this.updateSeries,
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
  // newSubDomainsPerItem => void
  onUpdateDomains: PropTypes.func,
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
  // (error, params) => void
  // Callback when data loader throws an error
  onFetchDataError: PropTypes.func,
};

DataProvider.defaultProps = {
  collections: [],
  defaultLoader: null,
  drawPoints: null,
  drawLines: undefined,
  onTimeSubDomainChanged: null,
  onUpdateDomains: null,
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
