import * as React from 'react';
import Scaler, { DomainsByItemId, OnDomainsUpdated } from '../Scaler';
import {
  Domain,
  LoaderFunction,
  Datapoint,
  DomainPriority,
} from '../../external';
import {
  IncomingCollection,
  IncomingSeries,
  IncomingItem,
  DataSeries,
  ScaledCollection,
  BaseSeries,
  BaseCollection,
} from '../../internal';
import CollectionJSX from '../Collection';
import SeriesJSX, { ItemProps } from '../Series';
import { combineItems } from '../../utils/items';
import { placeholder } from '../../utils/placeholder';
import { AxisDisplayMode } from '../..';
import { copyDomain } from '../../utils/domains';
import getItemsById from '../../utils/itemsById';

const deleteUndefinedFromItem = (obj: IncomingItem): IncomingItem => {
  return Object.keys(obj).reduce(
    (acc, k) => {
      // @ts-ignore - This is fine to index by key
      const value = obj[k];
      if (value !== undefined) {
        return { ...acc, [k]: value };
      }
      return acc;
    },
    { id: obj.id }
  );
};

const DEFAULT_LOADER_FUNCTION: LoaderFunction = ({ reason, oldSeries }) => {
  console.warn(`Missing loader!`, reason, oldSeries);
  return Promise.resolve(oldSeries);
};

const MINIMUM_SPAN_MILLIS = 100;
const DEFAULT_TIME_SUBDOMAIN_LIMITER: LimitTimeSubDomain = (
  subDomain: Domain
): Domain => {
  const difference = subDomain[1] - subDomain[0];
  if (difference < MINIMUM_SPAN_MILLIS) {
    const padding = (MINIMUM_SPAN_MILLIS - difference) / 2;
    const copy = copyDomain(subDomain);
    copy[0] -= padding;
    copy[1] += padding;
    return copy;
  }
  return subDomain;
};

const DEFAULT_SERIES_CONFIG: BaseSeries = {
  id: '',
  collectionId: undefined,
  color: 'black',
  data: [],
  hidden: false,
  drawLines: true,
  drawPoints: false,
  step: false,
  loader: DEFAULT_LOADER_FUNCTION,
  // FIXME: I don't like this 0 thing.
  timeAccessor: (d: Datapoint) => d.timestamp || 0,
  xAccessor: (d: Datapoint) => d.x || 0,
  x0Accessor: undefined,
  x1Accessor: undefined,
  yAccessor: (d: Datapoint) => d.y || 0,
  y0Accessor: undefined,
  y1Accessor: undefined,
  timeDomain: placeholder(0, 0),
  timeSubDomain: undefined,
  xDomain: undefined,
  xSubDomain: undefined,
  yDomain: undefined,
  ySubDomain: undefined,
  pointWidth: 6,
  strokeWidth: 1,
  yAxisPlacement: undefined,
  yAxisDisplayMode: AxisDisplayMode.ALL,
  pointsPerSeries: 50,
  zoomable: true,
  name: '',
  updateInterval: 0,
};

export type OnTimeSubDomainChanged = (timeSubDomain: Domain) => void;

export type LimitTimeSubDomain = (timeSubDomain: Domain) => Domain;

export type OnUpdateDomains = (subDomains: DomainsByItemId) => void;

export type TimeSubDomainLimiter = (subDomain: Domain) => Domain;

export interface Props extends ItemProps {
  timeDomain: Domain;
  timeSubDomain?: Domain;
  limitTimeSubDomain?: TimeSubDomainLimiter;
  onUpdateDomains?: OnUpdateDomains;

  series: IncomingSeries[];
  collections: IncomingCollection[];

  children: JSX.Element | JSX.Element[];
}

interface State {
  seriesById: { [seriesId: string]: IncomingSeries };
  collectionsById: { [collectionId: string]: IncomingCollection };
}

export type UnregisterSeriesFunction = () => void;

export type RegisterSeriesFunction = (
  series: IncomingSeries
) => UnregisterSeriesFunction;

export type UpdateSeriesFunction = (series: IncomingSeries) => void;

export type UnregisterCollectionFunction = () => void;

export type RegisterCollectionFunction = (
  collection: IncomingCollection
) => UnregisterCollectionFunction;

export type UpdateCollectionFunction = (collection: IncomingCollection) => void;

export type UpdateDomains = (
  mixedChangedDomainsById: DomainsByItemId,
  callback: OnDomainsUpdated
) => void;

export interface ContextType {
  series: DataSeries[];
  collections: ScaledCollection[];

  updateDomains: UpdateDomains;

  registerSeries: RegisterSeriesFunction;
  updateSeries: UpdateSeriesFunction;
  registerCollection: RegisterCollectionFunction;
  updateCollection: UpdateCollectionFunction;
}

export const Context = React.createContext<ContextType>({
  series: [],
  collections: [],

  updateDomains: () => null,

  registerSeries: () => () => {},
  updateSeries: () => {},
  registerCollection: () => () => {},
  updateCollection: () => {},
});

export default class Griff extends React.Component<Props, State> {
  state: State = {
    collectionsById: {},
    seriesById: {},
  };

  getCollectionObjects = (memberCount: { [collectionId: string]: number }) => {
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
    return Object.keys(collectionsById).reduce((acc: BaseCollection[], id) => {
      if (!memberCount[id]) {
        return acc;
      }
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
      const completedCollection: BaseCollection = combineItems(
        DEFAULT_SERIES_CONFIG,
        dataProvider,
        collection
      );
      return [...acc, completedCollection];
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
      timeDomain,
      timeSubDomain,
      updateInterval,
    } = this.props;
    const { collectionsById, seriesById } = this.state;
    return Object.keys(seriesById).reduce((acc: BaseSeries[], id) => {
      const series = seriesById[id];
      const dataProvider: IncomingItem = {
        id,
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
        updateInterval,
      };
      const collection: IncomingCollection =
        series.collectionId !== undefined
          ? collectionsById[series.collectionId] || { id: '' }
          : { id: '' };
      const completedSeries: BaseSeries = combineItems(
        DEFAULT_SERIES_CONFIG,
        dataProvider,
        collection,
        series
      );
      completedSeries.timeDomain = copyDomain(
        completedSeries.timeDomain,
        DomainPriority.GRIFF
      );
      return [...acc, completedSeries];
    }, []);
  };

  registerCollection = (incomingCollection: IncomingCollection) => {
    const { id } = incomingCollection;
    this.updateCollection(incomingCollection);

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

  updateCollection = ({ id, ...collection }: IncomingCollection) => {
    this.setState(({ collectionsById }) => ({
      collectionsById: {
        ...collectionsById,
        [id]: deleteUndefinedFromItem({
          ...collectionsById[id],
          ...collection,
          id,
        }),
      },
    }));
  };

  registerSeries = (incomingSeries: IncomingSeries) => {
    const { id } = incomingSeries;
    this.updateSeries(incomingSeries);

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

  updateSeries = ({ id, ...series }: IncomingSeries) => {
    this.setState(({ seriesById }) => ({
      seriesById: {
        ...seriesById,
        [id]: deleteUndefinedFromItem({
          ...seriesById[id],
          ...series,
          id,
        }),
      },
    }));
  };

  render() {
    const { children, onUpdateDomains } = this.props;

    const series = this.getSeriesObjects();
    const collectionIds = series.reduce<{
      [collectionId: string]: number;
    }>((ids, { collectionId }) => {
      if (!collectionId) {
        return ids;
      }
      return { ...ids, [collectionId]: (ids[collectionId] || 0) + 1 };
    }, {});
    const collections = this.getCollectionObjects(collectionIds);
    const collectionsById = getItemsById(collections);

    const filteredSeries = series.map(s => {
      if (!s.collectionId) {
        return s;
      }
      if (!collectionsById[s.collectionId]) {
        // This points to an invalid collection.
        const copy = { ...s };
        delete copy.collectionId;
        return copy;
      }
      return s;
    });

    const context = {
      limitTimeSubDomain: DEFAULT_TIME_SUBDOMAIN_LIMITER,
      series: filteredSeries,
      collections,
      seriesById: getItemsById(series),
      collectionsById,

      registerCollection: this.registerCollection,
      registerSeries: this.registerSeries,
      updateCollection: this.updateCollection,
      updateSeries: this.updateSeries,
    };

    return (
      <Scaler
        timeSubDomainChanged={() => null}
        onUpdateDomains={onUpdateDomains}
        {...context}
      >
        {children}
      </Scaler>
    );
  }
}
