import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';
import { Context as GriffContext } from '../Griff';
import { withDisplayName } from '../../utils/displayName';
import { calculateDomains } from '../../utils/domains';
import { deleteUndefinedFromObject } from '../../utils/cleaner';
import { placeholder, withoutPlaceholder } from '../../utils/placeholder';

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
    return 'SUBDOMAIN_CHANGED';
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

  getCollectionsObjects = () => {
    const {
      griffContextValue: { collections },
    } = this.props;
    return collections;
  };

  getSeriesObjects = () => {
    const {
      griffContextValue: { series },
    } = this.props;
    const { seriesById } = this.state;
    return series.map(s => {
      const obj = seriesById[s.id] || s;
      return {
        data: [],
        ...deleteUndefinedFromObject(obj),
        timeDomain:
          withoutPlaceholder(s.timeDomain, obj.timeDomain) || placeholder(0, 0),
        xDomain:
          withoutPlaceholder(s.xDomain, obj.xDomain) || placeholder(0, 0),
        yDomain:
          withoutPlaceholder(s.yDomain, obj.yDomain) || placeholder(0, 0),
        timeSubDomain:
          withoutPlaceholder(s.timeSubDomain, obj.timeSubDomain) ||
          placeholder(0, 0),
        xSubDomain:
          withoutPlaceholder(s.xSubDomain, obj.xSubDomain) || placeholder(0, 0),
        ySubDomain:
          withoutPlaceholder(s.ySubDomain, obj.ySubDomain) || placeholder(0, 0),
      };
    });
  };

  render() {
    const { griffContextValue, children } = this.props;

    const series = this.getSeriesObjects();
    const collections = this.getCollectionsObjects();

    const newContext = {
      ...griffContextValue,
      series,
      seriesById: series.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}),
      collections,
      collectionsById: collections.reduce(
        (acc, c) => ({ ...acc, [c.id]: c }),
        {}
      ),
    };

    return (
      <GriffContext.Provider value={newContext}>
        {children}
      </GriffContext.Provider>
    );
  }
}

export default withDisplayName('DataProvider', props => (
  <GriffContext.Consumer>
    {griffContextValue => (
      <DataProvider {...props} griffContextValue={griffContextValue} />
    )}
  </GriffContext.Consumer>
));
