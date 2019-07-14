import * as React from 'react';
import * as PropTypes from 'prop-types';
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
  yAxisPlacement: AxisPlacement.RIGHT,
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
    const { children } = this.props;

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
        onUpdateDomains={() => null}
        {...context}
      >
        {children}
      </Scaler>
    );
  }
}

// @ts-ignore
Griff.propTypes1 = {
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

// @ts-ignore
Griff.defaultProps1 = {
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
  x0Accessor: undefined,
  x1Accessor: undefined,
  y0Accessor: undefined,
  y1Accessor: undefined,
  yAxisWidth: 50,
  yDomain: undefined,
  ySubDomain: undefined,
  isTimeSubDomainSticky: false,
  onFetchData: () => {},
  // Just rethrow the error if there is no custom error handler
  series: [],
  collections: [],
};
