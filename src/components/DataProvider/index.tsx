import * as React from 'react';
import {
  Context as GriffContext,
  RegisterSeriesFunction,
  UpdateSeriesFunction,
  RegisterCollectionFunction,
  UpdateCollectionFunction,
  UpdateDomains,
} from '../Griff';
import { calculateDomains, isEqual } from '../../utils/domains';
import { deleteUndefinedFromObject } from '../../utils/cleaner';
import { placeholder, withoutPlaceholder } from '../../utils/placeholder';
import { LoaderResult, Domain, LoaderReason } from '../../external';
import { MinimalSeries, ScaledSeries, ScaledCollection } from '../../internal';
import { debounce } from 'lodash';

export interface Props {
  series: ScaledSeries[];
  collections: ScaledCollection[];

  updateDomains: UpdateDomains;
  registerSeries: RegisterSeriesFunction;
  updateSeries: UpdateSeriesFunction;
  registerCollection: RegisterCollectionFunction;
  updateCollection: UpdateCollectionFunction;
}

interface State {
  loaderResultsById: {
    [seriesId: string]: LoaderResult & {
      dataDomains: { time: Domain; x: Domain; y: Domain };
    };
  };
}

type SeriesById = { [seriesId: string]: ScaledSeries };

type SeriesByCollectionId = { [seriesId: string]: ScaledSeries };

interface RequestRecord {
  timestamp: number;
  timeSubDomain: Domain;
}

type FetchFunction = (
  series: MinimalSeries,
  reason: LoaderReason
) => Promise<void>;

class DataProvider extends React.Component<Props, State> {
  inFlightRequestsById: { [seriesId: string]: RequestRecord } = {};

  fetchFunctionsById: { [seriesId: string]: FetchFunction } = {};

  state: State = {
    loaderResultsById: {},
  };

  componentDidUpdate() {
    const { series } = this.props;

    series.forEach((s: MinimalSeries) => {
      const reason = this.getLoaderReason(s);
      if (reason) {
        let fetchFunction = this.fetchFunctionsById[s.id];
        if (!fetchFunction) {
          fetchFunction = debounce(this.fetchData(), 250);
          this.fetchFunctionsById[s.id] = fetchFunction;
        }
        fetchFunction(s, reason);
      }
    });
  }

  getLoaderReason = (series: MinimalSeries) => {
    if (!series.timeSubDomain) {
      // We don't have a timeSubDomain so there's nothing we can do.
      return null;
    }

    const { [series.id]: loaderResult } = this.inFlightRequestsById;

    if (!loaderResult) {
      // We've never seen this series before; load the initial data.
      return 'MOUNTED';
    }

    // Let's see if it matches what we already have loaded.
    const { timeSubDomain } = loaderResult;
    if (!timeSubDomain || !isEqual(timeSubDomain, series.timeSubDomain)) {
      // The time subdomain has changed, so we need to load new data.
      return 'SUBDOMAIN_CHANGED';
    }

    return null;
  };

  fetchData = () => async (series: MinimalSeries, reason: LoaderReason) => {
    const requestRecord: RequestRecord = this.inFlightRequestsById[series.id];
    if (requestRecord && Date.now() - requestRecord.timestamp < 250) {
      // Throttling!
      return;
    }

    const {
      loaderResultsById: { [series.id]: previousResult },
    } = this.state;

    const params = {
      id: series.id,
      timeDomain: series.timeDomain,
      timeSubDomain: series.timeSubDomain,
      pointsPerSeries: series.pointsPerSeries,
      oldSeries: { data: [], ...previousResult },
      reason,
    };

    this.inFlightRequestsById[series.id] = {
      timestamp: Date.now(),
      timeSubDomain: series.timeSubDomain,
    };

    const loaderResult = await series.loader(params);
    const domains = calculateDomains({ ...series, ...loaderResult });
    this.setState((state: State) => ({
      loaderResultsById: {
        ...state.loaderResultsById,
        [series.id]: { ...loaderResult, dataDomains: domains },
      },
    }));
  };

  getCollectionsObjects = () => {
    const { collections } = this.props;
    return collections;
  };

  getSeriesObjects = () => {
    const { series } = this.props;
    const { loaderResultsById } = this.state;
    return series.map((s: ScaledSeries) => {
      const loaderResult = loaderResultsById[s.id] || {};
      return {
        data: [],
        ...deleteUndefinedFromObject(s),
        ...deleteUndefinedFromObject(loaderResult),
        timeDomain:
          withoutPlaceholder(loaderResult.timeDomain, s.timeDomain) ||
          placeholder(0, 0),
        xDomain:
          withoutPlaceholder(loaderResult.xDomain, s.xDomain) ||
          placeholder(0, 0),
        yDomain:
          withoutPlaceholder(loaderResult.yDomain, s.yDomain) ||
          placeholder(0, 0),
        timeSubDomain:
          withoutPlaceholder(
            loaderResult.timeSubDomain,
            s.timeSubDomain,
            (loaderResult.dataDomains || {}).time
          ) || placeholder(0, 0),
        xSubDomain:
          withoutPlaceholder(
            loaderResult.xSubDomain,
            s.xSubDomain,
            (loaderResult.dataDomains || {}).x
          ) || placeholder(0, 0),
        ySubDomain:
          withoutPlaceholder(
            loaderResult.ySubDomain,
            s.ySubDomain,
            (loaderResult.dataDomains || {}).y
          ) || placeholder(0, 0),
      };
    });
  };

  render() {
    const { children, ...rest } = this.props;

    const series = this.getSeriesObjects();
    const collections = this.getCollectionsObjects();

    const newContext = {
      ...rest,
      series,
      seriesById: series.reduce(
        (acc: SeriesById, s: ScaledSeries) => ({ ...acc, [s.id]: s }),
        {}
      ),
      collections,
      collectionsById: collections.reduce(
        (acc: SeriesByCollectionId, c: ScaledCollection) => ({
          ...acc,
          [c.id]: c,
        }),
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

export default DataProvider;
