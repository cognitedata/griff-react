import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Promise from 'bluebird';
import * as d3 from 'd3';
import isEqual from 'lodash.isequal';
import DataContext from 'context/Data';
import Scaler from 'components/Scaler';
import Series from 'components/Series';
import Collection from 'components/Collection';

export const calculateDomainFromData = (
  data,
  accessor,
  minAccessor = undefined,
  maxAccessor = undefined
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

const getTimeSubDomain = (
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

const smallerDomain = (domain, subDomain) => {
  if (!domain && !subDomain) {
    return undefined;
  }

  if (!domain || !subDomain) {
    return domain || subDomain;
  }

  return [Math.max(domain[0], subDomain[0]), Math.min(domain[1], subDomain[1])];
};

const boundedDomain = (a, b) =>
  a && b ? [Math.min(a[0], b[0]), Math.max(a[1], b[1])] : a || b;

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
  timeDomain: undefined,
  timeSubDomain: undefined,
  xDomain: undefined,
  xSubDomain: undefined,
  yDomain: undefined,
  ySubDomain: undefined,
  pointWidth: 6,
  strokeWidth: 1,
};

export default class DataProvider extends Component {
  constructor(props) {
    super(props);
    const { limitTimeSubDomain, timeDomain, timeSubDomain } = props;
    this.state = {
      timeSubDomain: getTimeSubDomain(
        timeDomain,
        timeSubDomain,
        limitTimeSubDomain
      ),
      timeDomain,
      timeSubDomains: {},
      xSubDomains: {},
      ySubDomains: {},
      collectionsById: {},
      seriesById: {},
    };
  }

  componentDidMount() {
    const { updateInterval } = this.props;

    if (updateInterval) {
      this.startUpdateInterval();
    }
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
      this.startUpdateInterval();
    }

    // check if pointsPerSeries changed in props -- if so fetch new data
    if (pointsPerSeries !== prevProps.pointsPerSeries) {
      await Promise.map(series, s =>
        this.fetchData(s.id, 'UPDATE_POINTS_PER_SERIES')
      );
    }

    if (!isEqual(propsTimeSubDomain, prevProps.timeSubDomain)) {
      this.timeSubDomainChanged(propsTimeSubDomain);
    }

    // Check if timeDomain changed in props -- if so reset state.
    if (!isEqual(propsTimeDomain, prevProps.timeDomain)) {
      const { seriesById } = this.state;

      const newTimeSubDomain = getTimeSubDomain(
        propsTimeDomain,
        propsTimeSubDomain,
        limitTimeSubDomain
      );
      // eslint-disable-next-line
      this.setState(
        {
          timeDomain: propsTimeDomain,
          timeSubDomain: newTimeSubDomain,
          ySubDomains: {},
        },
        () => {
          Object.keys(seriesById).map(id => this.fetchData(id, 'MOUNTED'));
          if (onTimeSubDomainChanged) {
            onTimeSubDomainChanged(newTimeSubDomain);
          }
        }
      );
      this.startUpdateInterval();
    }
  }

  componentWillUnmount() {
    if (this.fetchInterval) {
      clearInterval(this.fetchInterval);
    }
  }

  getSeriesObjects = () => {
    const {
      drawLines,
      drawPoints,
      timeAccessor,
      xAccessor,
      x0Accessor,
      x1Accessor,
      yAccessor,
      y0Accessor,
      y1Accessor,
      timeDomain,
      timeSubDomain,
      xDomain,
      xSubDomain,
      yDomain,
      ySubDomain,
      pointWidth,
      strokeWidth,
      opacity,
      opacityAccessor,
      pointWidthAccessor,
    } = this.props;
    const {
      collectionsById,
      seriesById,
      timeSubDomains,
      xSubDomains,
      ySubDomains,
    } = this.state;
    return Object.keys(seriesById).reduce((acc, id) => {
      const series = seriesById[id];
      const dataProvider = {
        drawLines,
        drawPoints,
        pointWidth,
        strokeWidth,
        opacity,
        opacityAccessor,
        pointWidthAccessor,
        timeAccessor,
        xAccessor,
        x0Accessor,
        x1Accessor,
        yAccessor,
        y0Accessor,
        y1Accessor,
      };
      const collection =
        series.collectionId !== undefined
          ? collectionsById[series.collectionId] || {}
          : {};
      const completedSeries = {
        // First copy in the base-level configuration.
        ...DEFAULT_SERIES_CONFIG,

        // Then the global props from DataProvider, if any are set.
        ...dataProvider,

        // Then the domains because these are in the DataProvider state, which
        // supercedes the props.
        timeSubDomain: smallerDomain(
          timeDomain,
          timeSubDomain || timeSubDomains[id]
        ),
        xSubDomain: smallerDomain(xDomain, xSubDomain || xSubDomains[id]),
        ySubDomain: smallerDomain(yDomain, ySubDomain || ySubDomains[id]),
        timeDomain,
        xDomain,
        yDomain,

        // Next, copy over defaults from the parent collection, if there is one.
        ...collection,

        // Finally, the series configuration itself.
        ...series,
      };
      return [...acc, completedSeries];
    }, []);
  };

  onUpdateInterval = () => {
    const {
      isTimeSubDomainSticky,
      limitTimeSubDomain,
      updateInterval,
    } = this.props;
    const { seriesById, timeDomain, timeSubDomain } = this.state;
    const newTimeDomain = timeDomain.map(d => d + updateInterval);
    const newTimeSubDomain = isTimeSubDomainSticky
      ? getTimeSubDomain(
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
        Object.keys(seriesById).map(id => this.fetchData(id, 'INTERVAL'));
      }
    );
  };

  startUpdateInterval = () => {
    const { updateInterval } = this.props;
    if (this.fetchInterval) {
      clearInterval(this.fetchInterval);
    }
    if (updateInterval) {
      this.fetchInterval = setInterval(this.onUpdateInterval, updateInterval);
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
      recalcDataTimeSubDomainChanged,
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
      oldSeries: { data: [], ...seriesObject },
      reason,
    };
    try {
      loaderResult = await loader(params);
    } catch (e) {
      onFetchDataError(e, params);
    }

    this.setState(
      ({
        collectionsById,
        seriesById: { [id]: freshSeries },
        seriesById: freshSeriesById,
        timeSubDomains: freshTimeSubDomains,
        xSubDomains: freshXSubDomains,
        ySubDomains: freshYSubDomains,
      }) => {
        const stateUpdates = {};

        const series = {
          ...freshSeries,
          ...loaderResult,
        };

        if (
          // We either couldn't have any data before ...
          reason === 'MOUNTED' ||
          // Or the subdomain changed and we need to recalc the yDomain
          (reason === 'UPDATE_SUBDOMAIN' && recalcDataTimeSubDomainChanged) ||
          // ... or we didn't have data before, but do now!
          ((freshSeries.data || []).length === 0 &&
            (loaderResult.data || []).length > 0)
        ) {
          const collection = series.collectionId
            ? collectionsById[series.collectionId] || {}
            : {};

          stateUpdates.timeSubDomains = {
            ...freshTimeSubDomains,
            [id]: calculateDomainFromData(
              series.data,
              series.timeAccessor || timeAccessor || DEFAULT_ACCESSORS.time
            ),
          };
          stateUpdates.xSubDomains = {
            ...freshXSubDomains,
            [id]: calculateDomainFromData(
              series.data,
              series.xAccessor ||
                collection.xAccessor ||
                xAccessor ||
                DEFAULT_ACCESSORS.x,
              series.x0Accessor || collection.x0Accessor || x0Accessor,
              series.x1Accessor || collection.x1Accessor || x1Accessor
            ),
          };
          stateUpdates.ySubDomains = {
            ...freshYSubDomains,
            [id]: calculateDomainFromData(
              series.data,
              series.yAccessor ||
                collection.yAccessor ||
                yAccessor ||
                DEFAULT_ACCESSORS.y,
              series.y0Accessor || collection.y0Accessor || y0Accessor,
              series.y1Accessor || collection.y1Accessor || y1Accessor
            ),
          };

          series.timeSubDomain = series.timeSubDomain || series.timeDomain;
        }

        stateUpdates.seriesById = {
          ...freshSeriesById,
          [id]: series,
        };

        return stateUpdates;
      },
      () => {
        const {
          seriesById: { [id]: series },
        } = this.state;
        onFetchData({ ...series });
      }
    );
  };

  timeSubDomainChanged = timeSubDomain => {
    const { limitTimeSubDomain, onTimeSubDomainChanged } = this.props;
    const { timeDomain, timeSubDomain: current, seriesById } = this.state;
    const newTimeSubDomain = getTimeSubDomain(
      timeDomain,
      timeSubDomain,
      limitTimeSubDomain
    );
    if (isEqual(newTimeSubDomain, current)) {
      return;
    }

    clearTimeout(this.timeSubDomainChangedTimeout);
    this.timeSubDomainChangedTimeout = setTimeout(
      () =>
        Object.keys(seriesById).map(id =>
          this.fetchData(id, 'UPDATE_SUBDOMAIN')
        ),
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
          ...series,
          id,
        }),
      },
    }));
  };

  // Add a helper method to render the legacy props using the new tree structure
  // format. This is only intended to ease the transition pain and is not
  // intended to be an ongoing solution.
  renderLegacyItems = () => {
    const { series, collections } = this.props;
    if (series || collections) {
      return (
        <>
          {(series || []).map(s => (
            <Series key={s.id} {...s} />
          ))}
          {(collections || []).map(c => (
            <Collection key={c.id} {...c} />
          ))}
        </>
      );
    }
    return null;
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

    // // Compute the domains for all of the collections with one pass over all of
    // // the series objects.
    const domainsByCollectionId = seriesObjects.reduce((acc, series) => {
      const { collectionId } = series;
      if (!collectionId) {
        return acc;
      }

      const {
        timeDomain: seriesTimeDomain,
        timeSubDomain: seriesTimeSubDomain,
        xDomain: seriesXDomain,
        xSubDomain: seriesXSubDomain,
        yDomain: seriesYDomain,
        ySubDomain: seriesYSubDomain,
      } = series;

      const {
        timeDomain: collectionTimeDomain = [
          Number.MAX_SAFE_INTEGER,
          Number.MIN_SAFE_INTEGER,
        ],
        timeSubDomain: collectionTimeSubDomain = [
          Number.MAX_SAFE_INTEGER,
          Number.MIN_SAFE_INTEGER,
        ],
        xDomain: collectionXDomain = [
          Number.MAX_SAFE_INTEGER,
          Number.MIN_SAFE_INTEGER,
        ],
        xSubDomain: collectionXSubDomain = [
          Number.MAX_SAFE_INTEGER,
          Number.MIN_SAFE_INTEGER,
        ],
        yDomain: collectionYDomain = [
          Number.MAX_SAFE_INTEGER,
          Number.MIN_SAFE_INTEGER,
        ],
        ySubDomain: collectionYSubDomain = [
          Number.MAX_SAFE_INTEGER,
          Number.MIN_SAFE_INTEGER,
        ],
      } = acc[collectionId] || {};

      return {
        ...acc,
        [collectionId]: {
          timeDomain: seriesTimeDomain
            ? boundedDomain(collectionTimeDomain, seriesTimeDomain)
            : undefined,
          timeSubDomain: boundedDomain(
            collectionTimeSubDomain,
            seriesTimeSubDomain
          ),
          xDomain: seriesXDomain
            ? boundedDomain(collectionXDomain, seriesXDomain)
            : undefined,
          xSubDomain: boundedDomain(collectionXSubDomain, seriesXSubDomain),
          yDomain: seriesYDomain
            ? boundedDomain(collectionYDomain, seriesYDomain)
            : undefined,
          ySubDomain: boundedDomain(collectionYSubDomain, seriesYSubDomain),
        },
      };
    }, {});

    // Then we want to enrich the collection objects with their above-computed
    // domains.
    const collectionsWithDomains = Object.keys(collectionsById).reduce(
      (acc, id) => {
        if (!domainsByCollectionId[id]) {
          return acc;
        }
        return [
          ...acc,
          {
            ...collectionsById[id],
            ...domainsByCollectionId[id],
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
        const {
          timeDomain: collectionTimeDomain,
          timeSubDomain: collectionTimeSubDomain,
          xDomain: collectionXDomain,
          xSubDomain: collectionXSubDomain,
          yDomain: collectionYDomain,
          ySubDomain: collectionYSubDomain,
        } = domainsByCollectionId[collectionId] || {};

        if (collectionTimeDomain) {
          copy.timeDomain = collectionTimeDomain;
        }
        if (collectionTimeSubDomain) {
          copy.timeSubDomain = collectionTimeSubDomain;
        }
        if (collectionXDomain) {
          copy.xDomain = collectionXDomain;
        }
        if (collectionXSubDomain) {
          copy.xSubDomain = collectionXSubDomain;
        }
        if (collectionYDomain) {
          copy.yDomain = collectionYDomain;
        }
        if (collectionYSubDomain) {
          copy.ySubDomain = collectionYSubDomain;
        }
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
        {this.renderLegacyItems()}
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

  series: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    })
  ),
  collections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    })
  ),
  // Determines whether to recalc the data if the time subdomain changed
  recalcDataTimeSubDomainChanged: PropTypes.bool,
};

DataProvider.defaultProps = {
  defaultLoader: undefined,
  drawPoints: undefined,
  drawLines: undefined,
  onTimeSubDomainChanged: undefined,
  onUpdateDomains: undefined,
  opacity: 1.0,
  opacityAccessor: undefined,
  pointsPerSeries: 250,
  pointWidth: undefined,
  pointWidthAccessor: undefined,
  strokeWidth: undefined,
  timeDomain: undefined,
  timeSubDomain: undefined,
  xDomain: undefined,
  xSubDomain: undefined,
  updateInterval: 0,
  timeAccessor: d => d.timestamp,
  x0Accessor: undefined,
  x1Accessor: undefined,
  xAccessor: d => d.timestamp,
  y0Accessor: undefined,
  y1Accessor: undefined,
  yAccessor: d => d.value,
  yAxisWidth: 50,
  yDomain: undefined,
  ySubDomain: undefined,
  isTimeSubDomainSticky: false,
  limitTimeSubDomain: xSubDomain => xSubDomain,
  onFetchData: () => {},
  // Just rethrow the error if there is no custom error handler
  onFetchDataError: e => {
    throw e;
  },
  series: [],
  collections: [],
  recalcDataTimeSubDomainChanged: false,
};
