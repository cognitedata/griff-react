import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';
import { Context as GriffContext } from '../Griff';
import { withDisplayName } from '../../utils/displayName';
import { calculateDomains } from '../../utils/domains';
import { deleteUndefinedFromObject } from '../../utils/cleaner';
import { withoutPlaceholder } from '../../utils/placeholder';

const getRequestId = s => `[${s.timeSubDomain[0]}, ${s.timeSubDomain[1]}]`;

const getLoaderReason = (oldSeries, newSeries) => {
  if (!newSeries.timeSubDomain) {
    // We don't have a timeSubDomain so there's nothing we can do.
    return null;
  }

  if (!oldSeries) {
    // We've never seen this series before; load the initial data.
    return 'MOUNTED';
  }

  // Let's see if it matches what we already have loaded.
  const { timeSubDomain } = oldSeries;
  if (!isEqual(timeSubDomain, newSeries.timeSubDomain)) {
    // The time subdomain has changed, so we need to load new data.
    return 'TIME_SUBDOMAIN_CHANGED';
  }

  return null;
};

class DataProvider extends React.Component {
  state = {
    seriesById: {},
  };

  inFlightRequestsById = {};

  lastUpdate = 0;

  componentDidUpdate() {
    const {
      griffContextValue: { series },
    } = this.props;

    const { seriesById } = this.state;

    series.forEach(s => {
      const reason = getLoaderReason(seriesById[s.id], s);
      if (reason) {
        this.fetchData(s, reason);
      }
    });
  }

  fetchData = async (series, reason) => {
    const requestId = getRequestId(series);
    this.inFlightRequestsById[series.id] = requestId;
    const params = {
      id: series.id,
      timeDomain: series.timeDomain,
      timeSubDomain: series.timeSubDomain,
      pointsPerSeries: series.pointsPerSeries,
      oldSeries: { data: [], ...series },
      reason,
    };
    const newSeries = await series.loader(params);
    this.setState(state => {
      const { [series.id]: inFlightRequest } = this.inFlightRequestsById;
      if (inFlightRequest !== requestId) {
        // Abort;
        return null;
      }

      const domains = calculateDomains({ ...series, ...newSeries });
      const resultingSeries = {
        ...deleteUndefinedFromObject(series),
        ...deleteUndefinedFromObject(newSeries),
        timeSubDomain: withoutPlaceholder(
          newSeries.timeSubDomain,
          series.timeSubDomain,
          domains.time
        ),
        xSubDomain: withoutPlaceholder(
          newSeries.xSubDomain,
          series.xSubDomain,
          domains.x
        ),
        ySubDomain: withoutPlaceholder(
          newSeries.ySubDomain,
          series.ySubDomain,
          domains.y
        ),
        dataDomains: domains,
      };

      return {
        seriesById: {
          ...state.seriesById,
          [series.id]: resultingSeries,
        },
      };
    });
  };

  render() {
    const {
      griffContextValue,
      griffContextValue: { series },
      children,
    } = this.props;
    const { seriesById } = this.state;
    const newContext = {
      ...griffContextValue,
      series: series.map(s => seriesById[s.id] || s),
    };

    return (
      <GriffContext.Provider value={newContext}>
        {children}
      </GriffContext.Provider>
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
};

export default withDisplayName('DataProvider', props => (
  <GriffContext.Consumer>
    {griffContextValue => (
      <DataProvider {...props} griffContextValue={griffContextValue} />
    )}
  </GriffContext.Consumer>
));
