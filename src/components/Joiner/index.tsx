import * as React from 'react';
import {
  DataSeries,
  ScaledCollection,
  ItemIdMap,
  DataDomains,
} from '../../internal';
import { Props as DataProviderProps } from '../DataProvider';
import { GriffContext } from '../..';
import { withoutPlaceholder } from '../../utils/placeholder';
import {
  copyDomain,
  copyDataDomains,
  PLACEHOLDER_SUBDOMAIN,
} from '../../utils/domains';

export interface Props extends DataProviderProps {
  series: DataSeries[];
  collections: ScaledCollection[];
}

const Joiner: React.FunctionComponent<Props> = (props: Props) => {
  const { children, series, collections, ...rest } = props;

  const seriesById: { [seriesId: string]: DataSeries } = {};

  const collectionsById: ItemIdMap<ScaledCollection> = collections.reduce(
    (acc, c) => ({ ...acc, [c.id]: { ...c } }),
    {}
  );

  const dataDomainsByCollectionId: { [collectionId: string]: DataDomains } = {};

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
      const collection = collectionsById[s.collectionId];

      if (collection.timeDomain.placeholder) {
        // We replace the placeholder one with the one from the first series.
        collection.timeDomain = copyDomain(joined.timeDomain);
      } else {
        collection.timeDomain[0] = Math.min(
          collection.timeDomain[0],
          joined.timeDomain[0]
        );
        collection.timeDomain[1] = Math.max(
          collection.timeDomain[1],
          joined.timeDomain[1]
        );
      }

      if (collection.xDomain.placeholder) {
        // We replace the placeholder one with the one from the first series.
        collection.xDomain = copyDomain(joined.xDomain);
      } else {
        collection.xDomain[0] = Math.min(
          collection.xDomain[0],
          joined.xDomain[0]
        );
        collection.xDomain[1] = Math.max(
          collection.xDomain[1],
          joined.xDomain[1]
        );
      }

      if (collection.yDomain.placeholder) {
        // We replace the placeholder one with the one from the first series.
        collection.yDomain = copyDomain(joined.yDomain);
      } else {
        collection.yDomain[0] = Math.min(
          collection.yDomain[0],
          joined.yDomain[0]
        );
        collection.yDomain[1] = Math.max(
          collection.yDomain[1],
          joined.yDomain[1]
        );
      }

      if (collection.timeSubDomain.placeholder) {
        // We replace the placeholder one with the one from the first series.
        collection.timeSubDomain = copyDomain(joined.timeSubDomain);
      } else {
        collection.timeSubDomain[0] = Math.min(
          collection.timeSubDomain[0],
          joined.timeSubDomain[0]
        );
        collection.timeSubDomain[1] = Math.max(
          collection.timeSubDomain[1],
          joined.timeSubDomain[1]
        );
      }

      if (collection.xSubDomain.placeholder) {
        // We replace the placeholder one with the one from the first series.
        collection.xSubDomain = copyDomain(joined.xSubDomain);
      } else {
        collection.xSubDomain[0] = Math.min(
          collection.xSubDomain[0],
          joined.xSubDomain[0]
        );
        collection.xSubDomain[1] = Math.max(
          collection.xSubDomain[1],
          joined.xSubDomain[1]
        );
      }

      if (collection.ySubDomain.placeholder) {
        // We replace the placeholder one with the one from the first series.
        collection.ySubDomain = copyDomain(joined.ySubDomain);
      } else {
        collection.ySubDomain[0] = Math.min(
          collection.ySubDomain[0],
          joined.ySubDomain[0],
          !collection.yDomain.placeholder
            ? collection.yDomain[0]
            : Number.MAX_SAFE_INTEGER,
          !joined.yDomain.placeholder
            ? joined.yDomain[0]
            : Number.MAX_SAFE_INTEGER
        );
        collection.ySubDomain[1] = Math.max(
          collection.ySubDomain[1],
          joined.ySubDomain[1]
        );
      }

      const domains = dataDomainsByCollectionId[s.collectionId];
      if (!domains) {
        dataDomainsByCollectionId[s.collectionId] = copyDataDomains(
          s.dataDomains
        );
      } else {
        domains.time[0] = Math.min(domains.time[0], joined.dataDomains.time[0]);
        domains.time[1] = Math.max(domains.time[1], joined.dataDomains.time[1]);
        domains.x[0] = Math.min(domains.x[0], joined.dataDomains.x[0]);
        domains.x[1] = Math.max(domains.x[1], joined.dataDomains.x[1]);
        domains.y[0] = Math.min(domains.y[0], joined.dataDomains.y[0]);
        domains.y[1] = Math.max(domains.y[1], joined.dataDomains.y[1]);
      }
    }
    return joined;
  });

  const joinedCollections = collections.map(c => {
    return collectionsById[c.id];
  });

  // We need to do one final pass over the series to make sure that all of the
  // collected series share their domains with the collection.
  if (joinedCollections.length > 0) {
    joinedSeries = joinedSeries.map(s => {
      if (!s.collectionId) {
        return s;
      }
      const collection = collectionsById[s.collectionId];
      return {
        ...s,
        timeDomain: collection.timeDomain,
        xDomain: collection.xDomain,
        yDomain: collection.yDomain,
        timeSubDomain: collection.timeSubDomain,
        xSubDomain: collection.xSubDomain,
        ySubDomain: collection.ySubDomain,
        dataDomains: dataDomainsByCollectionId[s.collectionId],
      };
    });
  }

  const context = {
    ...rest,
    series: joinedSeries,
    collections: joinedCollections,
    seriesById,
    collectionsById,
  };
  return (
    <GriffContext.Provider value={context}>{children}</GriffContext.Provider>
  );
};

export default Joiner;
