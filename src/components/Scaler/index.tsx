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
  BaseItem,
  ScaledSeries,
  ScaledCollection,
} from '../../internal';
import { DataProvider } from '../..';
import { placeholder, withoutPlaceholder } from '../../utils/placeholder';
import {
  isEqual,
  copyDomain,
  PLACEHOLDER_SUBDOMAIN,
  PLACEHOLDER_DOMAIN,
  newDomain,
  highestPriorityDomain,
} from '../../utils/domains';

export interface Props {
  timeSubDomainChanged: OnTimeSubDomainChanged;
  limitTimeSubDomain?: LimitTimeSubDomain;
  onUpdateDomains?: OnUpdateDomains;
  updateInterval?: number;
  children: JSX.Element | JSX.Element[];

  series: BaseSeries[];
  collections: BaseCollection[];
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

interface State {
  /** Subdomains of the items, according to the current state. */
  subDomainsByItemId: DomainsByItemId;
}

export interface OnDomainsUpdated extends Function {}

type DomainAxis = 'time' | 'x' | 'y';

// If the timeSubDomain is within this margin (as a percent over the time
// subdomain), consider it to be attached to the leading edge of the timeDomain.
const FRONT_OF_WINDOW_THRESHOLD = 0.02;

const getDomain = (series: ScaledSeries, axis: 'time' | 'x' | 'y') => {
  switch (String(axis)) {
    case 'time':
      return series.timeDomain;
    case 'x':
      return series.xDomain;
    case 'y':
      return series.yDomain;
    default:
      return null;
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
    updateInterval: PropTypes.number,
  };

  static defaultProps = {};

  state: State = {
    subDomainsByItemId: {},
  };

  seriesById: { [seriesId: string]: ScaledSeries } = {};
  collectionsById: { [collectionsId: string]: ScaledCollection } = {};
  seriesByCollectionId: { [collectionId: string]: ItemId[] } = {};

  fetchInterval?: NodeJS.Timeout;

  componentDidUpdateNope(prevProps: Props) {
    // We need to find when a Series' defined subDomains change because
    // then the state needs to be updated.

    const { series: prevSeries, collections: prevCollections } = prevProps;

    const prevSeriesById: { [id: string]: BaseItem } = (prevCollections || [])
      .concat(prevSeries)
      .reduce((acc, s) => ({ ...acc, [s.id]: s }), {});

    interface SubDomainChanges {
      time?: boolean;
      x?: boolean;
      y?: boolean;
    }

    const changedSubDomainsById: {
      [itemId: string]: SubDomainChanges;
    } = {};
    const { series, collections } = this.props;

    let updateRequired = false;

    const { subDomainsByItemId } = this.state;

    const findChangedSubDomains = (item: BaseItem) => {
      const p = prevSeriesById[item.id];

      const changes: SubDomainChanges = {};
      let changed = false;
      if (p) {
        const subDomains = subDomainsByItemId[item.id] || {};

        if (
          item.xSubDomain &&
          p.xSubDomain &&
          subDomains.x &&
          !isEqual(item.xSubDomain, p.xSubDomain)
        ) {
          changes.x = true;
          changed = true;
        }
        if (
          item.ySubDomain &&
          p.ySubDomain &&
          subDomains.y &&
          !isEqual(item.ySubDomain, p.ySubDomain)
        ) {
          changes.y = true;
          changed = true;
        }
      }

      changedSubDomainsById[item.id] = changes;
      updateRequired = updateRequired || changed;
    };

    series.forEach(findChangedSubDomains);
    collections.forEach(findChangedSubDomains);

    if (updateRequired) {
      this.setState(({ subDomainsByItemId }) => {
        const newSubDomainsByItemId = Object.keys(changedSubDomainsById).reduce(
          (acc, id) => {
            const subDomains = { ...subDomainsByItemId[id] };
            const changedSubDomains = changedSubDomainsById[id];

            if (changedSubDomains.x) {
              delete subDomains.x;
            }

            if (changedSubDomains.y) {
              delete subDomains.y;
            }

            return { ...acc, [id]: subDomains };
          },
          {}
        );
        return { subDomainsByItemId: newSubDomainsByItemId };
      });
    }
  }

  /**
   * Return an all of the series, with domains/subdomains guaranteed to be
   * populated, even if they're populated with placeholders.
   */
  getSeriesWithDomains = (): ScaledSeries[] => {
    const { series } = this.props;

    const { subDomainsByItemId } = this.state;

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

      const subDomains = subDomainsByItemId[id] || {};

      const newTimeDomain =
        timeDomain || placeholder(0, Number.MAX_SAFE_INTEGER);
      const newXDomain =
        xDomain ||
        placeholder(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
      const newYDomain =
        yDomain ||
        placeholder(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);

      const newTimeSubDomain =
        subDomains.time ||
        timeSubDomain ||
        placeholder(0, Number.MAX_SAFE_INTEGER);

      const withDomains = {
        ...s,
        timeSubDomain: getLimitedSubDomain(newTimeSubDomain, newTimeDomain),
        xDomain: newXDomain,
        xSubDomain: getLimitedSubDomain(
          subDomains.x ||
            xSubDomain ||
            placeholder(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
          newXDomain
        ),
        yDomain: newYDomain,
        ySubDomain: getLimitedSubDomain(
          subDomains.y ||
            ySubDomain ||
            placeholder(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
          newYDomain
        ),
      };
      this.seriesById[id] = withDomains;
      return withDomains;
    });
  };

  getCollectionsWithDomains = (): ScaledCollection[] => {
    const { collections } = this.props;
    return collections.map(c => ({
      ...c,
      timeSubDomain:
        withoutPlaceholder(c.timeSubDomain, c.timeDomain) ||
        PLACEHOLDER_SUBDOMAIN,
      xDomain: withoutPlaceholder(c.xDomain) || PLACEHOLDER_DOMAIN,
      xSubDomain: withoutPlaceholder(c.xSubDomain) || PLACEHOLDER_SUBDOMAIN,
      yDomain: withoutPlaceholder(c.yDomain) || PLACEHOLDER_DOMAIN,
      ySubDomain: withoutPlaceholder(c.ySubDomain) || PLACEHOLDER_SUBDOMAIN,
    }));
  };

  getCollectionsWithDomainsOld = (
    series: ScaledSeries[]
  ): ScaledCollection[] => {
    const { collections } = this.props;
    if (collections.length === 0) {
      return [];
    }

    // We can't store these in this.collectionsById because the collections
    // have not been fully-resolved at this point in time and might have missing
    // domains.
    const collectionsById: {
      [id: string]: ScaledCollection;
    } = collections.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});

    const collectionDomainsById: PopulatedDomainsByItemId = {};
    const collectionSubDomainsById: PopulatedDomainsByItemId = {};

    series.forEach(s => {
      if (!s.collectionId) {
        return;
      }

      const c = collectionsById[s.collectionId];
      if (!c) {
        // This is pointing to a ficticious collection.
        return;
      }

      const domains = collectionDomainsById[s.collectionId];
      const subDomains = collectionSubDomainsById[s.collectionId];

      let skip = false;
      if (!domains) {
        collectionDomainsById[s.collectionId] = {
          time: copyDomain(s.timeDomain),
          x: copyDomain(s.xDomain),
          y: copyDomain(s.yDomain),
        };
        skip = true;
      }

      if (!subDomains) {
        collectionSubDomainsById[s.collectionId] = {
          time: copyDomain(s.timeSubDomain),
          x: copyDomain(s.xSubDomain),
          y: copyDomain(s.ySubDomain),
        };
        skip = true;
      }

      if (skip) {
        // All done; we can skip to the next one.
        return;
      }

      const collectionDomains = collectionDomainsById[s.collectionId];
      collectionDomains.time[0] = Math.min(domains.time[0], s.timeDomain[0]);
      collectionDomains.time[1] = Math.max(domains.time[1], s.timeDomain[1]);
      collectionDomains.x[0] = Math.min(domains.x[0], s.xDomain[0]);
      collectionDomains.x[1] = Math.max(domains.x[1], s.xDomain[1]);
      collectionDomains.y[0] = Math.min(domains.y[0], s.yDomain[0]);
      collectionDomains.y[1] = Math.max(domains.y[1], s.yDomain[1]);

      const collectionSubDomains = collectionSubDomainsById[s.collectionId];
      collectionSubDomains.time[0] = Math.min(
        subDomains.time[0],
        s.timeSubDomain[0]
      );
      collectionSubDomains.time[1] = Math.max(
        subDomains.time[1],
        s.timeSubDomain[1]
      );
      collectionSubDomains.x[0] = Math.min(subDomains.x[0], s.xSubDomain[0]);
      collectionSubDomains.x[1] = Math.max(subDomains.x[1], s.xSubDomain[1]);
      collectionSubDomains.y[0] = Math.min(subDomains.y[0], s.ySubDomain[0]);
      collectionSubDomains.y[1] = Math.max(subDomains.y[1], s.ySubDomain[1]);
    });

    // Now we need to assemble the information we just computed!
    return collections.reduce((acc, c) => {
      const domains = collectionDomainsById[c.id];
      const subDomains = collectionSubDomainsById[c.id];
      if (!domains || !subDomains) {
        // This represents a collection without any children.
        return acc;
      }

      const scaledCollection: ScaledCollection = {
        ...c,
        timeDomain: domains.time,
        xDomain: domains.x,
        yDomain: domains.y,
        timeSubDomain: subDomains.time,
        xSubDomain: subDomains.x,
        ySubDomain: subDomains.y,
      };
      return [...acc, scaledCollection];
    }, new Array<ScaledCollection>());
  };

  getSeriesWithCollectedDomains = (series: ScaledSeries[]): ScaledSeries[] => {
    return series.map(s => {
      if (!s.collectionId) {
        return s;
      }

      const collection = this.collectionsById[s.collectionId];
      if (!collection) {
        // This should never ever happen. But hey, solar flares ...
        return s;
      }

      return {
        ...s,
        timeDomain: collection.timeDomain,
        timeSubDomain: collection.timeSubDomain,
        xDomain: collection.xDomain,
        xSubDomain: collection.xSubDomain,
        yDomain: collection.yDomain,
        ySubDomain: collection.ySubDomain,
      };
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

        const limits =
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
