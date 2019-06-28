import * as React from 'react';
import {
  DataSeries,
  ScaledCollection,
  ItemIdMap,
  DataDomains,
} from '../../internal';
import { Props as DataProviderProps } from '../DataProvider';
import { GriffContext } from '../..';
import { withoutPlaceholder, placeholder } from '../../utils/placeholder';
import { Domain } from '../../external';
import { copyDomain, copyDataDomains } from '../../utils/domains';

export interface Props extends DataProviderProps {
  series: DataSeries[];
  collections: ScaledCollection[];
}

const PLACEHOLDER_DOMAIN = placeholder(
  Number.MIN_SAFE_INTEGER,
  Number.MAX_SAFE_INTEGER
);

const PLACEHOLDER_SUBDOMAIN = placeholder(0, 0);

const Joiner: React.FunctionComponent<Props> = (props: Props) => {
  const { children, series, collections, ...rest } = props;

  const seriesById: { [seriesId: string]: DataSeries } = {};

  const subDomainsByCollectionId: {
    [collectionId: string]: {
      time: Domain;
      x: Domain;
      y: Domain;
      data: DataDomains;
    };
  } = {};

  let joinedSeries = series.map(s => {
    const { dataDomains, timeSubDomain, xSubDomain, ySubDomain } = s;
    const joined: DataSeries = {
      ...s,
      timeSubDomain:
        withoutPlaceholder(timeSubDomain, dataDomains.time) ||
        PLACEHOLDER_SUBDOMAIN,
      xSubDomain:
        withoutPlaceholder(xSubDomain, dataDomains.x) || PLACEHOLDER_SUBDOMAIN,
      ySubDomain:
        withoutPlaceholder(ySubDomain, dataDomains.y) || PLACEHOLDER_SUBDOMAIN,
    };
    seriesById[s.id] = joined;
    if (s.collectionId) {
      if (!subDomainsByCollectionId[s.collectionId]) {
        subDomainsByCollectionId[s.collectionId] = {
          time: copyDomain(joined.timeSubDomain),
          x: copyDomain(joined.xSubDomain),
          y: copyDomain(joined.ySubDomain),
          data: copyDataDomains(joined.dataDomains),
        };
      } else {
        const subDomains = subDomainsByCollectionId[s.collectionId];
        subDomains.time[0] = Math.min(
          joined.timeSubDomain[0],
          subDomains.time[0]
        );
        subDomains.time[1] = Math.max(
          joined.timeSubDomain[1],
          subDomains.time[1]
        );
        subDomains.x[0] = Math.min(joined.xSubDomain[0], subDomains.x[0]);
        subDomains.x[1] = Math.max(joined.xSubDomain[1], subDomains.x[1]);
        subDomains.y[0] = Math.min(joined.ySubDomain[0], subDomains.y[0]);
        subDomains.y[1] = Math.max(joined.ySubDomain[1], subDomains.y[1]);

        subDomains.data.time[0] = Math.min(
          joined.dataDomains.time[0],
          subDomains.data.time[0]
        );
        subDomains.data.time[1] = Math.max(
          joined.dataDomains.time[1],
          subDomains.data.time[1]
        );
        subDomains.data.x[0] = Math.min(
          joined.dataDomains.x[0],
          subDomains.data.x[0]
        );
        subDomains.data.x[1] = Math.max(
          joined.dataDomains.x[1],
          subDomains.data.x[1]
        );
        subDomains.data.y[0] = Math.min(
          joined.dataDomains.y[0],
          subDomains.data.y[0]
        );
        subDomains.data.y[1] = Math.max(
          joined.dataDomains.y[1],
          subDomains.data.y[1]
        );

        subDomainsByCollectionId[s.collectionId] = subDomains;
      }
    }
    return joined;
  });

  const collectionsById: ItemIdMap<ScaledCollection> = {};

  const joinedCollections = collections.map(c => {
    const { [c.id]: subDomains } = subDomainsByCollectionId;
    const joinedCollection = {
      ...c,
      timeSubDomain: subDomains.time,
      xSubDomain: subDomains.x,
      ySubDomain: subDomains.y,
    };
    collectionsById[c.id] = joinedCollection;
    return joinedCollection;
  });

  // We need to do one final pass over the series to make sure that all of the
  // collected series share their domains with the collection.
  if (joinedCollections.length > 0) {
    joinedSeries = joinedSeries.map(s => {
      if (!s.collectionId) {
        return s;
      }
      const domains = subDomainsByCollectionId[s.collectionId];
      return {
        ...s,
        timeSubDomain: domains.time,
        xSubDomain: domains.x,
        ySubDomain: domains.y,
        dataDomains: domains.data,
      };
    });
  }

  const newContext = {
    ...rest,
    series: joinedSeries,
    collections: joinedCollections,
    seriesById,
    collectionsById,
  };
  return (
    <GriffContext.Provider value={newContext}>{children}</GriffContext.Provider>
  );
};

export default Joiner;
