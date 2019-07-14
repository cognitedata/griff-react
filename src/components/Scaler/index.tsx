import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  OnTimeSubDomainChanged,
  LimitTimeSubDomain,
  OnUpdateDomains,
  RegisterSeriesFunction,
  UpdateSeriesFunction,
  RegisterCollectionFunction,
  UpdateCollectionFunction,
} from '../Griff';
import GriffPropTypes, { seriesPropType } from '../../utils/proptypes';
import Axes from '../../utils/Axes';
import { Domain, ItemId } from '../../external';
import {
  BaseSeries,
  BaseCollection,
  ScaledSeries,
  ScaledCollection,
  ItemIdMap,
} from '../../internal';
import { DataProvider } from '../..';
import { placeholder, withoutPlaceholder } from '../../utils/placeholder';
import {
  PLACEHOLDER_SUBDOMAIN,
  PLACEHOLDER_DOMAIN,
  newDomain,
  highestPriorityDomain,
  copyDomain,
  isEqual,
} from '../../utils/domains';

export interface Props {
  timeSubDomainChanged: OnTimeSubDomainChanged;
  limitTimeSubDomain?: LimitTimeSubDomain;
  onUpdateDomains?: OnUpdateDomains;
  children: JSX.Element | JSX.Element[];

  series: BaseSeries[];
  collections: BaseCollection[];
  seriesById: ItemIdMap<BaseSeries>;

  registerSeries: RegisterSeriesFunction;
  updateSeries: UpdateSeriesFunction;
  registerCollection: RegisterCollectionFunction;
  updateCollection: UpdateCollectionFunction;
}

export interface DomainsByItemId {
  [itemId: string]: {
    time: Domain;
    x?: Domain;
    y?: Domain;
  };
}

export interface PopulatedDomainsByItemId {
  [itemId: string]: {
    time: Domain;
    x: Domain;
    y: Domain;
  };
}

interface FetchIntervalRecord {
  id: NodeJS.Timeout;
  interval: number;
}

interface State {
  /** Subdomains of the items, according to the current state. */
  subDomainsByItemId: DomainsByItemId;

  /** Domains of the items, according to the current state. */
  domainsByItemId: DomainsByItemId;
}

export interface OnDomainsUpdated extends Function {}

type DomainAxis = 'time' | 'x' | 'y';

// If the timeSubDomain is within this margin (as a percent over the time
// subdomain), consider it to be attached to the leading edge of the timeDomain.
const FRONT_OF_WINDOW_THRESHOLD = 0.02;

const getDomain = (
  item: ScaledSeries | ScaledCollection | undefined,
  axis: 'time' | 'x' | 'y'
): Domain | undefined => {
  if (!item) {
    return undefined;
  }
  switch (String(axis)) {
    case 'time':
      return item.timeDomain;
    case 'x':
      return item.xDomain;
    case 'y':
      return item.yDomain;
    default:
      return undefined;
  }
};

const getSubDomain = (series: ScaledSeries, axis: 'time' | 'x' | 'y') => {
  switch (String(axis)) {
    case 'time':
      return series.timeSubDomain;
    case 'x':
      return series.xSubDomain;
    case 'y':
      return series.ySubDomain;
    default:
      return null;
  }
};

const getLimitedSubDomain = (subDomain: Domain, domain: Domain): Domain => {
  return newDomain(
    Math.max(subDomain[0], domain[0]),
    Math.min(subDomain[1], domain[1]),
    subDomain.priority
  );
};

/**
 * The scaler is the source of truth for all things related to the domains and
 * subdomains for all of the items within Griff. Note that an item can be either
 * a series or a collection, and domains are flexible. As of this writing, there
 * are three axes:
 *   time: The timestamp of a datapoint
 *   x: The x-value of a datapoint
 *   y: The y-value of a datapoint.
 *
 * These axes all have separate domains and subdomains. The domain is the range
 * of that axis, and the subdomain is the currently-visible region of that
 * range.
 *
 * These are manipulated with the {@link #updateDomains} function, which is
 * made available through the {@link ScalerContext}.
 */
class Scaler extends React.Component<Props, State> {
  static propTypes = {
    children: PropTypes.node.isRequired,
    limitTimeSubDomain: PropTypes.func,
    series: seriesPropType.isRequired,
    collections: GriffPropTypes.collections.isRequired,
    seriesById: GriffPropTypes.itemsByItemId.isRequired,
  };

  static defaultProps = {};

  state: State = {
    subDomainsByItemId: {},
    domainsByItemId: {},
  };

  fetchIntervals: { [seriesId: string]: FetchIntervalRecord } = {};

  seriesById: { [seriesId: string]: ScaledSeries } = {};
  collectionsById: { [collectionsId: string]: ScaledCollection } = {};
  seriesByCollectionId: { [collectionId: string]: ItemId[] } = {};

  componentDidUpdate(prevProps: Props) {
    const { seriesById: oldSeriesById = {} } = prevProps;
    const { series } = this.props;
    series.forEach(s => {
      // Update the domains/subdomains (if necessary).
      const {
        domainsByItemId: { [s.id]: domains },
        subDomainsByItemId: { [s.id]: subDomains },
      } = this.state;
      if (!domains) {
        this.setState((state: State) => ({
          domainsByItemId: {
            ...state.domainsByItemId,
            [s.id]: {
              time: copyDomain(s.timeDomain),
              x: copyDomain(
                withoutPlaceholder(s.xDomain) || PLACEHOLDER_DOMAIN
              ),
              y: copyDomain(
                withoutPlaceholder(s.yDomain) || PLACEHOLDER_DOMAIN
              ),
            },
          },
        }));
      }
      if (!subDomains) {
        this.setState((state: State) => ({
          subDomainsByItemId: {
            ...state.subDomainsByItemId,
            [s.id]: {
              time: copyDomain(
                withoutPlaceholder(s.timeSubDomain) || s.timeDomain
              ),
              x: copyDomain(
                withoutPlaceholder(s.xSubDomain) || PLACEHOLDER_SUBDOMAIN
              ),
              y: copyDomain(
                withoutPlaceholder(s.ySubDomain) || PLACEHOLDER_SUBDOMAIN
              ),
            },
          },
        }));
      }

      // If the domains were changed externally, then we need to update the
      // internal map because that's the new source of truth.
      const oldSeries = oldSeriesById[s.id];
      if (oldSeries) {
        const {
          timeDomain: oldTimeDomain,
          xDomain: oldXDomain,
          yDomain: oldYDomain,
        } = oldSeries;
        const { timeDomain, xDomain, yDomain } = s;
        if (
          !isEqual(timeDomain, oldTimeDomain) ||
          !isEqual(xDomain, oldXDomain) ||
          !isEqual(yDomain, oldYDomain)
        ) {
          const updates = {
            time: timeDomain || oldTimeDomain,
            x: xDomain || oldXDomain,
            y: yDomain || oldYDomain,
          };
          this.setState((state: State) => ({
            domainsByItemId: {
              ...state.domainsByItemId,
              [s.id]: updates,
            },
          }));
        }
      }

      // Update the live-loading information (if necessary).
      const { [s.id]: fetchIntervalRecord } = this.fetchIntervals;
      if (s.updateInterval) {
        if (fetchIntervalRecord) {
          if (s.updateInterval !== fetchIntervalRecord.interval) {
            // The updateInterval changed; remove the old one.
            clearInterval(fetchIntervalRecord.id);
            delete this.fetchIntervals[s.id];
            // Need to set a new one.
            this.fetchIntervals[s.id] = this.scheduleUpdates(s);
          } else {
            // No-op -- the record is already up-to-date.
          }
        } else {
          // Need to set a new one.
          this.fetchIntervals[s.id] = this.scheduleUpdates(s);
        }
      } else {
        if (fetchIntervalRecord) {
          // The updateInterval was removed; clear the timeout.
          clearInterval(fetchIntervalRecord.id);
          delete this.fetchIntervals[s.id];
        }
      }
    });
  }

  componentWillUnmount() {
    Object.keys(this.fetchIntervals)
      .map(id => this.fetchIntervals[id])
      .forEach(record => {
        clearInterval(record.id);
      });
  }

  scheduleUpdates = (series: BaseSeries): FetchIntervalRecord => {
    const { updateInterval } = series;
    if (!updateInterval) {
      throw new Error('Invalid call path');
    }

    const advanceClock = () =>
      this.setState(state => {
        const {
          subDomainsByItemId: { [series.id]: subDomains },
          domainsByItemId: { [series.id]: domains },
        } = state;

        if (!domains) {
          // I don't know what state we're in, but there's nothing we can do.
          return null;
        }

        const newTimeDomain = copyDomain(domains.time);
        newTimeDomain[0] += updateInterval;
        newTimeDomain[1] += updateInterval;

        const newTimeSubDomain = copyDomain(
          subDomains ? subDomains.time : domains.time
        );
        newTimeSubDomain[0] += updateInterval;
        newTimeSubDomain[1] += updateInterval;

        return {
          domainsByItemId: {
            ...state.domainsByItemId,
            [series.id]: {
              ...state.domainsByItemId[series.id],
              time: newTimeDomain,
            },
          },
          subDomainsByItemId: {
            ...state.subDomainsByItemId,
            [series.id]: {
              ...state.subDomainsByItemId[series.id],
              time: newTimeSubDomain,
            },
          },
        };
      });
    return {
      id: setInterval(advanceClock, updateInterval),
      interval: updateInterval,
    };
  };

  /**
   * Return an all of the series, with domains/subdomains guaranteed to be
   * populated, even if they're populated with placeholders.
   */
  getSeriesWithDomains = (): ScaledSeries[] => {
    const { series } = this.props;

    const { domainsByItemId, subDomainsByItemId } = this.state;

    return series.map((s: BaseSeries) => {
      const {
        id,
        timeDomain,
        timeSubDomain,
        xDomain,
        xSubDomain,
        yDomain,
        ySubDomain,
      } = s;

      const domains = domainsByItemId[id] || {};
      const subDomains = subDomainsByItemId[id] || {};

      const newTimeDomain =
        highestPriorityDomain(domains.time, timeDomain) ||
        placeholder(0, Number.MAX_SAFE_INTEGER);
      const newXDomain = xDomain || PLACEHOLDER_DOMAIN;
      const newYDomain = yDomain || PLACEHOLDER_DOMAIN;

      const newTimeSubDomain =
        highestPriorityDomain(subDomains.time, timeSubDomain) ||
        placeholder(0, Number.MAX_SAFE_INTEGER);

      const newXSubDomain =
        highestPriorityDomain(subDomains.x, xSubDomain) ||
        PLACEHOLDER_SUBDOMAIN;

      const newYSubDomain =
        highestPriorityDomain(subDomains.y, ySubDomain) ||
        PLACEHOLDER_SUBDOMAIN;

      const withDomains = {
        ...s,
        timeDomain: newTimeDomain,
        timeSubDomain: getLimitedSubDomain(newTimeSubDomain, newTimeDomain),
        xDomain: newXDomain,
        xSubDomain: getLimitedSubDomain(newXSubDomain, newXDomain),
        yDomain: newYDomain,
        ySubDomain: getLimitedSubDomain(newYSubDomain, newYDomain),
      };
      this.seriesById[id] = withDomains;
      if (s.collectionId) {
        if (!this.seriesByCollectionId[s.collectionId]) {
          this.seriesByCollectionId[s.collectionId] = [];
        }
        this.seriesByCollectionId[s.collectionId].push(id);
      }
      return withDomains;
    });
  };

  getCollectionsWithDomains = (): ScaledCollection[] => {
    const { collections } = this.props;
    return collections.map(c => {
      const withDomains = {
        ...c,
        timeSubDomain:
          withoutPlaceholder(c.timeSubDomain, c.timeDomain) ||
          PLACEHOLDER_SUBDOMAIN,
        xDomain: withoutPlaceholder(c.xDomain) || PLACEHOLDER_DOMAIN,
        xSubDomain: withoutPlaceholder(c.xSubDomain) || PLACEHOLDER_SUBDOMAIN,
        yDomain: withoutPlaceholder(c.yDomain) || PLACEHOLDER_DOMAIN,
        ySubDomain: withoutPlaceholder(c.ySubDomain) || PLACEHOLDER_SUBDOMAIN,
      };
      this.collectionsById[c.id] = withDomains;
      return withDomains;
    });
  };

  /**
   * Update the subdomains for the given items. This is a patch update and will
   * be merged with the current state of the subdomains. An example payload
   * will resemble:
   * <code>
   *   {
   *     "series-1": {
   *       "y": [0.5, 0.75],
   *     },
   *     "series-2": {
   *       "y": [1.0, 2.0],
   *     }
   *   }
   * </code>
   *
   * After this is complete, {@code callback} will be called with this patch
   * object.
   */
  updateDomains = (
    mixedChangedDomainsById: DomainsByItemId,
    callback: OnDomainsUpdated
  ) => {
    const { limitTimeSubDomain, onUpdateDomains } = this.props;
    const { subDomainsByItemId } = this.state;
    const newSubDomains = { ...subDomainsByItemId };

    // Convert collections into their component series IDs.
    const changedDomainsById: DomainsByItemId = Object.keys(
      mixedChangedDomainsById
    ).reduce((acc, itemId) => {
      if (this.seriesByCollectionId[itemId]) {
        // This is a collection; we need to add in all of its component series.
        return this.seriesByCollectionId[itemId].reduce(
          (domains, seriesId) => ({
            ...domains,
            [seriesId]: mixedChangedDomainsById[itemId],
          }),
          acc
        );
      } else if (this.seriesById[itemId]) {
        // Great, this is a series; copy it and move on.
        return { ...acc, [itemId]: mixedChangedDomainsById[itemId] };
      } else {
        // Wat.
        return acc;
      }
    }, {});

    Object.keys(changedDomainsById).forEach(itemId => {
      newSubDomains[itemId] = { ...(subDomainsByItemId[itemId] || {}) };

      // At this point, changeDomainsById only contains IDs which are series
      // objects.
      const s = this.seriesById[itemId] || {};

      Object.keys(changedDomainsById[itemId]).forEach(uncastAxis => {
        const axis: DomainAxis = uncastAxis as DomainAxis;
        const changedDomains = changedDomainsById[itemId];
        // There's no guarantee that this exists
        const subDomains = subDomainsByItemId[itemId] || {};
        let newSubDomain =
          highestPriorityDomain(changedDomains[axis], subDomains[axis]) ||
          placeholder(0, 0);
        if (axis === String(Axes.time)) {
          if (limitTimeSubDomain) {
            newSubDomain = limitTimeSubDomain(newSubDomain);
          }
        }
        const newSpan = newSubDomain[1] - newSubDomain[0];
        const existingSubDomain = getSubDomain(s, axis) || newSubDomain;
        const existingSpan = existingSubDomain[1] - existingSubDomain[0];

        const collection = s.collectionId
          ? this.collectionsById[s.collectionId]
          : undefined;

        const limits =
          getDomain(collection, axis) ||
          getDomain(s, axis) ||
          // Set a large range because this is a limiting range.
          placeholder(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);

        if (newSpan === existingSpan) {
          // This is a translation; check the bounds.
          if (newSubDomain[0] <= limits[0]) {
            newSubDomain = newDomain(
              limits[0],
              limits[0] + newSpan,
              newSubDomain.priority
            );
          }
          if (newSubDomain[1] >= limits[1]) {
            newSubDomain = newDomain(
              limits[1] - newSpan,
              limits[1],
              newSubDomain.priority
            );
          }
        } else {
          newSubDomain = newDomain(
            Math.max(limits[0], newSubDomain[0]),
            Math.min(limits[1], newSubDomain[1]),
            newSubDomain.priority
          );
        }
        newSubDomains[itemId][axis] = newSubDomain;
      });
    });
    // expose newSubDomains to DataProvider
    if (onUpdateDomains) {
      onUpdateDomains(newSubDomains);
    }
    this.setState(
      { subDomainsByItemId: newSubDomains },
      callback ? () => callback(changedDomainsById) : undefined
    );
  };

  render() {
    const { children } = this.props;

    // Do a first pass over all of the series to make copies of the Series so
    // that they're all guaranteed to have domains populated.
    const seriesWithDomains = this.getSeriesWithDomains();

    // Next, we need to do another pass in order to find the domains for any
    // collections which may be present.
    const collectionsWithDomains = this.getCollectionsWithDomains();

    const context = {
      ...this.props,

      collections: collectionsWithDomains,
      collectionsById: this.collectionsById,
      series: seriesWithDomains,
      seriesById: this.seriesById,

      updateDomains: this.updateDomains,
    };

    return <DataProvider {...context}>{children}</DataProvider>;
  }
}

export default Scaler;
