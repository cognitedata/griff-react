import * as React from 'react';
import { DataSeries, ScaledCollection } from '../../internal';
import { Props as DataProviderProps } from '../DataProvider';
import { GriffContext } from '../..';
import { withoutPlaceholder, placeholder } from '../../utils/placeholder';
import { Domain } from '../../external';
import { copyDomain } from '../../utils/domains';

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
    [collectionId: string]: { time: Domain; x: Domain; y: Domain };
  } = {};

  const joinedSeries = series.map(s => {
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
        subDomainsByCollectionId[s.collectionId] = subDomains;
      }
    }
    return joined;
  });

  const joinedCollections = collections.map(c => {
    const { [c.id]: subDomains } = subDomainsByCollectionId;
    return {
      ...c,
      timeSubDomain: subDomains.time,
      xSubDomain: subDomains.x,
      ySubDomain: subDomains.y,
    };
  });

  const collectionsById = joinedCollections.reduce(
    (acc, c) => ({ ...acc, [c.id]: c }),
    {}
  );

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
