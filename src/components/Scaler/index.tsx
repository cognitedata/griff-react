import * as React from 'react';
import * as PropTypes from 'prop-types';
import DataContext from '../../context/Data';
import ScalerContext from '../../context/Scaler';
import GriffPropTypes, { seriesPropType } from '../../utils/proptypes';
import Axes, { Domains } from '../../utils/Axes';
import { Domain, Series, Collection } from '../../external';
import { Item } from '../../internal';
import { withDisplayName } from '../../utils/displayName';

// TODO: Move this to DataProvider.
type OnTimeSubDomainChanged = (timeSubDomain: Domain) => void;

// TODO: Move this to DataProvider.
type LimitTimeSubDomain = (timeSubDomain: Domain) => Domain;

// TODO: Move this to DataProvider.
type OnUpdateDomains = (subDomains: DomainsByItemId) => void;

// TODO: Move this to DataProvider.
interface DataContext {
  timeDomain: Domain;
  timeSubDomain: Domain;
  timeSubDomainChanged: OnTimeSubDomainChanged;
  limitTimeSubDomain: LimitTimeSubDomain | undefined;
  externalXSubDomain: Domain | undefined;
  series: Series[];
  collections: Collection[];
  onUpdateDomains: OnUpdateDomains;
}

export interface Props {
  children: React.ReactChild | React.ReactChild[];
  dataContext: DataContext;
}

export interface DomainsByItemId {
  [itemId: string]: Domains;
}

interface State {
  domainsByItemId: DomainsByItemId;
  subDomainsByItemId: DomainsByItemId;
}

export interface OnDomainsUpdated extends Function {}

type DomainAxis = 'time' | 'x' | 'y';

interface StateUpdates {
  domainsByItemId: DomainsByItemId;
  subDomainsByItemId: DomainsByItemId;
}

// If the timeSubDomain is within this margin, consider it to be attached to
// the leading edge of the timeDomain.
const FRONT_OF_WINDOW_THRESHOLD = 0.05;

/**
 * Provide a placeholder domain so that we can test for validity later, but
 * it can be safely operated on like a real domain.
 */
export const placeholder = (min: number, max: number): Domain => {
  const domain: Domain = [min, max];
  domain.placeholder = true;
  return domain;
};

const haveDomainsChanged = (before: Item, after: Item) =>
  before.timeDomain !== after.timeDomain ||
  before.timeSubDomain !== after.timeSubDomain ||
  before.xDomain !== after.xDomain ||
  before.xSubDomain !== after.xSubDomain ||
  before.yDomain !== after.yDomain ||
  before.ySubDomain !== after.ySubDomain;

const findItemsWithChangedDomains = (
  previousItems: Item[],
  currentItems: Item[]
) => {
  const previousItemsById: { [itemId: string]: Item } = previousItems.reduce(
    (acc, s) => ({
      ...acc,
      [s.id]: s,
    }),
    {}
  );
  return currentItems.reduce((acc: Item[], s) => {
    if (
      !previousItemsById[s.id] ||
      haveDomainsChanged(previousItemsById[s.id] || {}, s)
    ) {
      return [...acc, s];
    }
    return acc;
  }, []);
};

const isEqual = (a: Domain, b: Domain): boolean => {
  if (a === b) {
    return true;
  }
  if ((!a && b) || (a && !b)) {
    return false;
  }
  return a[0] === b[0] && a[1] === b[1];
};

export const firstResolvedDomain = (
  domain: Domain | undefined,
  // tslint:disable-next-line
  ...domains: (undefined | Domain)[]
): Domain | undefined => {
  if (domain && domain.placeholder !== true) {
    return [...domain] as Domain;
  }
  if (domains.length === 0) {
    return undefined;
  }
  return firstResolvedDomain(domains[0], ...(domains.splice(1) as Domain[]));
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
    dataContext: PropTypes.shape({
      timeDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
      timeSubDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
      timeSubDomainChanged: PropTypes.func.isRequired,
      limitTimeSubDomain: PropTypes.func,
      externalXSubDomain: PropTypes.arrayOf(PropTypes.number),
      series: seriesPropType.isRequired,
      collections: GriffPropTypes.collections.isRequired,
    }).isRequired,
  };

  static defaultProps = {};

  static getDerivedStateFromProps(
    { dataContext: { timeDomain, timeSubDomain, series, collections } }: Props,
    state: State
  ) {
    // Make sure that all items in the props are present in the domainsByItemId
    // and subDomainsByItemId state objects.
    const { domainsByItemId, subDomainsByItemId } = state;
    let updated = false;
    const stateUpdates = series.concat(collections).reduce(
      (acc: StateUpdates, item: Item): StateUpdates => {
        const updates: StateUpdates = { ...acc };
        if (!domainsByItemId[item.id]) {
          updated = true;
          updates.domainsByItemId = {
            ...updates.domainsByItemId,
            [item.id]: {
              time: [...timeDomain] as Domain,
              x:
                firstResolvedDomain(item.xDomain) ||
                placeholder(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
              y:
                firstResolvedDomain(item.yDomain) ||
                placeholder(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
            },
          };
        }

        if (!subDomainsByItemId[item.id]) {
          updated = true;
          updates.subDomainsByItemId = {
            ...updates.subDomainsByItemId,
            [item.id]: {
              time: [...timeSubDomain] as Domain,
              x: firstResolvedDomain(item.xSubDomain) || placeholder(0, 1),
              y: firstResolvedDomain(item.ySubDomain) || placeholder(0, 1),
            },
          };
        }

        return updates;
      },
      { domainsByItemId: {}, subDomainsByItemId: {} }
    );
    return updated ? stateUpdates : null;
  }

  state: State = {
    domainsByItemId: {},
    subDomainsByItemId: {},
  };

  componentDidUpdate(prevProps: Props) {
    const { dataContext } = this.props;
    const {
      domainsByItemId: oldDomainsByItemId,
      subDomainsByItemId: oldSubDomainsByItemId,
    } = this.state;

    const changedSeries = findItemsWithChangedDomains(
      prevProps.dataContext.series,
      dataContext.series
    );
    const changedCollections = findItemsWithChangedDomains(
      prevProps.dataContext.collections,
      dataContext.collections
    );
    if (changedSeries.length > 0 || changedCollections.length > 0) {
      const domainsByItemId = { ...oldDomainsByItemId };
      const subDomainsByItemId = { ...oldSubDomainsByItemId };

      [...changedSeries, ...changedCollections].forEach(item => {
        domainsByItemId[item.id] = {
          time:
            firstResolvedDomain(
              dataContext.timeDomain,
              item.timeDomain,
              Axes.time(oldDomainsByItemId[item.id])
            ) || placeholder(0, Date.now()),
          x:
            firstResolvedDomain(
              item.xDomain,
              Axes.x(oldDomainsByItemId[item.id])
            ) ||
            // Set a large range because this is a domain.
            placeholder(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
          y:
            firstResolvedDomain(
              item.yDomain,
              Axes.y(oldDomainsByItemId[item.id])
            ) ||
            // Set a large range because this is a domain.
            placeholder(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
        };
        subDomainsByItemId[item.id] = {
          time:
            firstResolvedDomain(
              dataContext.timeSubDomain ||
                (item.timeSubDomain ||
                  Axes.time(oldSubDomainsByItemId[item.id]))
            ) ||
            // Set a large range because this is a subdomain.
            placeholder(0, Date.now()),
          x:
            firstResolvedDomain(
              item.xSubDomain,
              Axes.x(oldSubDomainsByItemId[item.id])
            ) ||
            // Set a small range because this is a subdomain.
            placeholder(0, 1),
          y:
            firstResolvedDomain(
              item.ySubDomain || Axes.y(oldSubDomainsByItemId[item.id])
            ) ||
            // Set a small range because this is a subdomain.
            placeholder(0, 1),
        };
      });
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ subDomainsByItemId, domainsByItemId });
      return;
    }

    if (!isEqual(prevProps.dataContext.timeDomain, dataContext.timeDomain)) {
      const { timeDomain: prevTimeDomain } = prevProps.dataContext;
      const { timeDomain: nextTimeDomain } = dataContext;

      // When timeDomain changes, we need to update everything downstream.
      const domainsByItemId = { ...oldDomainsByItemId };
      Object.keys(domainsByItemId).forEach(itemId => {
        domainsByItemId[itemId].time = nextTimeDomain;
      });

      const subDomainsByItemId = { ...oldSubDomainsByItemId };
      Object.keys(subDomainsByItemId).forEach(itemId => {
        const { time: timeSubDomain } = oldSubDomainsByItemId[itemId];
        subDomainsByItemId[itemId] = {
          ...oldSubDomainsByItemId[itemId],
        };
        const dt = timeSubDomain[1] - timeSubDomain[0];
        if (
          Math.abs((timeSubDomain[1] - prevTimeDomain[1]) / dt) <=
          FRONT_OF_WINDOW_THRESHOLD
        ) {
          // Looking at the front of the window -- continue to track that.
          subDomainsByItemId[itemId].time = [
            nextTimeDomain[1] - dt,
            nextTimeDomain[1],
          ];
        } else if (timeSubDomain[0] <= prevTimeDomain[0]) {
          // Looking at the back of the window -- continue to track that.
          subDomainsByItemId[itemId].time = [
            prevTimeDomain[0],
            prevTimeDomain[0] + dt,
          ];
        }
      });

      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ domainsByItemId, subDomainsByItemId });
    }

    if (
      !isEqual(prevProps.dataContext.timeSubDomain, dataContext.timeSubDomain)
    ) {
      // When timeSubDomain changes, we need to update everything downstream.
      const newSubDomainsByItemId: DomainsByItemId = {};
      Object.keys(oldSubDomainsByItemId).forEach(itemId => {
        newSubDomainsByItemId[itemId] = {
          ...oldSubDomainsByItemId[itemId],
          time: dataContext.timeSubDomain,
        };
      });
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ subDomainsByItemId: newSubDomainsByItemId });
    }
  }

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
    changedDomainsById: DomainsByItemId,
    callback: OnDomainsUpdated
  ) => {
    // FIXME: This is not multi-series aware.
    let newTimeSubDomain = null;

    const { dataContext } = this.props;
    const { domainsByItemId, subDomainsByItemId } = this.state;
    const newSubDomains = { ...subDomainsByItemId };
    Object.keys(changedDomainsById).forEach(itemId => {
      newSubDomains[itemId] = { ...(subDomainsByItemId[itemId] || {}) };
      Object.keys(changedDomainsById[itemId]).forEach(uncastAxis => {
        const axis: DomainAxis = uncastAxis as DomainAxis;
        let newSubDomain = changedDomainsById[itemId][axis];
        if (axis === String(Axes.time)) {
          if (dataContext.limitTimeSubDomain) {
            newSubDomain = dataContext.limitTimeSubDomain(newSubDomain);
          }
        }

        const newSpan = newSubDomain[1] - newSubDomain[0];

        const existingSubDomain =
          subDomainsByItemId[itemId][axis] || newSubDomain;
        const existingSpan = existingSubDomain[1] - existingSubDomain[0];

        const limits =
          firstResolvedDomain(
            ((domainsByItemId || {})[itemId] || {})[axis],
            axis === String(Axes.time)
              ? // FIXME: Phase out this single timeDomain thing.
                dataContext.timeDomain
              : undefined
          ) ||
          // Set a large range because this is a limiting range.
          placeholder(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);

        if (newSpan === existingSpan) {
          // This is a translation; check the bounds.
          if (newSubDomain[0] <= limits[0]) {
            newSubDomain = [limits[0], limits[0] + newSpan];
          }
          if (newSubDomain[1] >= limits[1]) {
            newSubDomain = [limits[1] - newSpan, limits[1]];
          }
        } else {
          newSubDomain = [
            Math.max(limits[0], newSubDomain[0]),
            Math.min(limits[1], newSubDomain[1]),
          ];
        }

        newSubDomains[itemId][axis] = newSubDomain;

        if (axis === String(Axes.time)) {
          newTimeSubDomain = newSubDomain;
        }
      });
    });
    // expose newSubDomains to DataProvider
    if (dataContext.onUpdateDomains) {
      dataContext.onUpdateDomains(newSubDomains);
    }
    this.setState(
      { subDomainsByItemId: newSubDomains },
      callback ? () => callback(changedDomainsById) : undefined
    );
    if (newTimeSubDomain) {
      dataContext.timeSubDomainChanged(newTimeSubDomain);
    }
  };

  render() {
    const { domainsByItemId, subDomainsByItemId } = this.state;
    const {
      children,
      dataContext: { collections, series },
    } = this.props;

    const finalContext = {
      // Pick what we need out of the dataContext instead of spreading the
      // entire object into the context.
      collections,
      series,

      updateDomains: this.updateDomains,
      domainsByItemId,
      subDomainsByItemId,
    };

    return (
      <ScalerContext.Provider value={finalContext}>
        {children}
      </ScalerContext.Provider>
    );
  }
}

export default withDisplayName('Scaler', (props: Props) => (
  <DataContext.Consumer>
    {(dataContext: DataContext) => (
      <Scaler {...props} dataContext={dataContext} />
    )}
  </DataContext.Consumer>
));
