import * as React from 'react';
import { UpdateDomains } from '../Griff';
import {
  calculateDomains,
  isEqual,
  highestPriorityDomain,
} from '../../utils/domains';
import { deleteUndefinedFromObject } from '../../utils/cleaner';
import { placeholder } from '../../utils/placeholder';
import { LoaderResult, Domain, LoaderReason } from '../../external';
import { ScaledSeries, ScaledCollection } from '../../internal';
import { debounce } from 'lodash';
import { Props as ScalerProps } from '../Scaler';
import Joiner from '../Joiner';
import getItemsByItemId from '../../utils/itemsById';

export interface Props extends ScalerProps {
  series: ScaledSeries[];
  collections: ScaledCollection[];

  updateDomains: UpdateDomains;
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
  series: ScaledSeries,
  reason: LoaderReason
) => Promise<void>;

const PLACEHOLDER_SUBDOMAIN = placeholder(0, 0);

const DEFAULT_DATA_DOMAINS = {
  time: PLACEHOLDER_SUBDOMAIN,
  x: PLACEHOLDER_SUBDOMAIN,
  y: PLACEHOLDER_SUBDOMAIN,
};

class DataProvider extends React.Component<Props, State> {
  inFlightRequestsById: { [seriesId: string]: RequestRecord } = {};

  fetchFunctionsById: { [seriesId: string]: FetchFunction } = {};

  state: State = {
    loaderResultsById: {},
  };

  componentDidUpdate() {
    const { series } = this.props;

    series.forEach((s: ScaledSeries) => {
      const reason = this.getLoaderReason(s);
      console.log('TCL: DataProvider -> componentDidUpdate -> reason', reason);
      if (reason) {
        let fetchFunction = this.fetchFunctionsById[s.id];
        if (!fetchFunction) {
          fetchFunction = debounce(this.fetchData(), 250, { leading: true });
          this.fetchFunctionsById[s.id] = fetchFunction;
        }
        fetchFunction(s, reason);
      }
    });
  }

  getLoaderReason = (series: ScaledSeries) => {
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

  fetchData = () => async (series: ScaledSeries, reason: LoaderReason) => {
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
      oldSeries: {
        data: [],
        ...series,
        timeDomain: undefined,
        timeSubDomain: undefined,
        xDomain: undefined,
        xSubDomain: undefined,
        yDomain: undefined,
        ySubDomain: undefined,
        ...previousResult,
      },
      reason,
    };

    this.inFlightRequestsById[series.id] = {
      timestamp: Date.now(),
      timeSubDomain: series.timeSubDomain,
    };

    const loaderResult = await series.loader(params);
    this.setState((state: State) => {
      const domains = calculateDomains({ ...series, ...loaderResult });
      return {
        loaderResultsById: {
          ...state.loaderResultsById,
          [series.id]: { ...loaderResult, dataDomains: domains },
        },
      };
    });
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
      const output = {
        dataDomains: DEFAULT_DATA_DOMAINS,
        ...s,
        ...deleteUndefinedFromObject(loaderResult),
        data: loaderResult.data || s.data || [],
        ySubDomain:
          highestPriorityDomain(
            s.ySubDomain,
            loaderResult.ySubDomain,
            (loaderResult.dataDomains || {}).y
          ) || s.ySubDomain,
      };
      return output;
    });
  };

  render() {
    const { children, ...rest } = this.props;

    const series = this.getSeriesObjects();
    const collections = this.getCollectionsObjects();

    const newContext = {
      ...rest,
      series,
      seriesById: getItemsByItemId(series),
      collections,
      collectionsById: getItemsByItemId(collections),
    };

    return <Joiner {...newContext}>{children}</Joiner>;
  }
}

export default DataProvider;
