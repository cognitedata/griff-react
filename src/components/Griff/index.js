import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Scaler from '../Scaler';
import Series from '../Series';
import Collection from '../Collection';

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

const DEFAULT_ACCESSORS = {
  time: d => d.timestamp,
  x: d => d.x,
  y: d => d.value,
};

const DEFAULT_LOADER_FUNCTION = ({ reason, oldSeries }) => {
  console.warn(`Missing loader!`, reason, oldSeries);
  return Promise.resolve(oldSeries);
};

const DEFAULT_SERIES_CONFIG = {
  color: 'black',
  data: [],
  hidden: false,
  drawPoints: false,
  loader: DEFAULT_LOADER_FUNCTION,
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

export const Context = React.createContext({});

export default class Griff extends Component {
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
      collectionsById: {},
      seriesById: {},
    };
  }

  // async componentDidUpdate_old(prevProps) {
  //   // If new series are present in prop,
  //   // run the fetchData lifecycle for those series
  //   const {
  //     limitTimeSubDomain,
  //     onTimeSubDomainChanged,
  //     pointsPerSeries,
  //     series,
  //     timeDomain: propsTimeDomain,
  //     timeSubDomain: propsTimeSubDomain,
  //   } = this.props;
  //   // check if pointsPerSeries changed in props -- if so fetch new data
  //   if (pointsPerSeries !== prevProps.pointsPerSeries) {
  //     await Promise.map(series, s =>
  //       this.fetchData(s.id, 'UPDATE_POINTS_PER_SERIES')
  //     );
  //   }

  //   if (!isEqual(propsTimeSubDomain, prevProps.timeSubDomain)) {
  //     this.timeSubDomainChanged(propsTimeSubDomain);
  //   }

  //   // Check if timeDomain changed in props -- if so reset state.
  //   if (!isEqual(propsTimeDomain, prevProps.timeDomain)) {
  //     const { seriesById } = this.state;

  //     const newTimeSubDomain = getTimeSubDomain(
  //       propsTimeDomain,
  //       propsTimeSubDomain,
  //       limitTimeSubDomain
  //     );
  //     // eslint-disable-next-line
  //     this.setState(
  //       {
  //         timeDomain: propsTimeDomain,
  //         timeSubDomain: newTimeSubDomain,
  //       },
  //       () => {
  //         Object.keys(seriesById).map(id => this.fetchData(id, 'MOUNTED'));
  //         if (onTimeSubDomainChanged) {
  //           onTimeSubDomainChanged(newTimeSubDomain);
  //         }
  //       }
  //     );
  //   }
  // }

  getCollectionObjects = () => {
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
    const { collectionsById } = this.state;
    return Object.keys(collectionsById).reduce((acc, id) => {
      const collection = collectionsById[id];
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
        timeDomain,
        timeSubDomain,
        xDomain,
        xSubDomain,
        yDomain,
        ySubDomain,
      };
      const completedSeries = {
        // First copy in the base-level configuration.
        ...DEFAULT_SERIES_CONFIG,

        // Then the global props from DataProvider, if any are set.
        ...dataProvider,

        // Finally, the collection configuration itself.
        ...collection,
      };
      return [...acc, completedSeries];
    }, []);
  };

  getSeriesObjects = () => {
    const {
      drawLines,
      drawPoints,
      loader,
      timeAccessor,
      xAccessor,
      x0Accessor,
      x1Accessor,
      yAccessor,
      y0Accessor,
      y1Accessor,
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
      timeDomain,
      timeSubDomain,
    } = this.state;
    return Object.keys(seriesById).reduce((acc, id) => {
      const series = seriesById[id];
      const dataProvider = {
        drawLines,
        drawPoints,
        loader,
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
        timeDomain,
        timeSubDomain,
        xDomain,
        xSubDomain,
        yDomain,
        ySubDomain,
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

        // Next, copy over defaults from the parent collection, if there is one.
        ...collection,

        // Finally, the series configuration itself.
        ...series,
      };
      return [...acc, completedSeries];
    }, []);
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
    this.setState(({ seriesById }) => ({
      seriesById: {
        ...seriesById,
        [id]: deleteUndefinedFromObject({
          ...series,
          id,
        }),
      },
    }));

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
        <React.Fragment>
          {(series || []).map(s => (
            <Series key={s.id} {...s} />
          ))}
          {(collections || []).map(c => (
            <Collection key={c.id} {...c} />
          ))}
        </React.Fragment>
      );
    }
    return null;
  };

  render() {
    const { children, ...otherProps } = this.props;
    const scalerProps = {
      ...otherProps,
    };

    const griffContext = {
      series: this.getSeriesObjects(),
      collections: this.getCollectionObjects(),
      registerCollection: this.registerCollection,
      registerSeries: this.registerSeries,
      updateCollection: this.updateCollection,
      updateSeries: this.updateSeries,
    };
    console.log('TCL: render -> series', griffContext.series);

    return (
      <Context.Provider value={griffContext}>
        <Scaler
          timeSubDomainChanged={(...args) => console.error(...args)}
          {...scalerProps}
        >
          {children}
        </Scaler>
      </Context.Provider>
    );
  }
}

Griff.propTypes = {
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
  loader: PropTypes.func,
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
};

Griff.defaultProps = {
  loader: undefined,
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
};
