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
import { AxisDisplayMode, AxisPlacement } from '../..';
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
    return Object.keys(collectionsById).reduce((acc: BaseCollection[], id) => {
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

  registerCollection = ({ id, ...collection }: IncomingCollection) => {
    this.setState(({ collectionsById }) => ({
      collectionsById: {
        ...collectionsById,
        [id]: deleteUndefinedFromItem({
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

  registerSeries = ({ id, ...series }: IncomingSeries) => {
    this.setState(({ seriesById }) => ({
      seriesById: {
        ...seriesById,
        [id]: deleteUndefinedFromItem({
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

  // Add a helper method to render the legacy props using the new tree structure
  // format. This is only intended to ease the transition pain and is not
  // intended to be an ongoing solution.
  renderLegacyItems = () => {
    const { series, collections } = this.props;
    if (series || collections) {
      return (
        <React.Fragment>
          {(series || []).map(s => (
            <SeriesJSX key={s.id} {...s} />
          ))}
          {(collections || []).map(c => (
            <CollectionJSX key={c.id} {...c} />
          ))}
        </React.Fragment>
      );
    }
    return null;
  };

  render() {
    const { children, onUpdateDomains } = this.props;

    const series = this.getSeriesObjects();
    const collections = this.getCollectionObjects();

    const context = {
      limitTimeSubDomain: DEFAULT_TIME_SUBDOMAIN_LIMITER,
      series,
      collections,
      seriesById: getItemsById(series),
      collectionsById: getItemsById(collections),

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
