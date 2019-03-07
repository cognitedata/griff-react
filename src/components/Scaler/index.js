import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';
import DataContext from '../../context/Data';
import ScalerContext from '../../context/Scaler';
import GriffPropTypes, { seriesPropType } from '../../utils/proptypes';
import Axes from '../../utils/Axes';

// If the timeSubDomain is within this margin, consider it to be attached to
// the leading edge of the timeDomain.
const FRONT_OF_WINDOW_THRESHOLD = 0.05;

/**
 * Provide a placeholder domain so that we can test for validity later, but
 * it can be safely operated on like a real domain.
 */
export const PLACEHOLDER_DOMAIN = [0, 0];

const haveDomainsChanged = (before, after) =>
  before.timeDomain !== after.timeDomain ||
  before.timeSubDomain !== after.timeSubDomain ||
  before.xDomain !== after.xDomain ||
  before.xSubDomain !== after.xSubDomain ||
  before.yDomain !== after.yDomain ||
  before.ySubDomain !== after.ySubDomain;

const findItemsWithChangedDomains = (previousItems, currentItems) => {
  const previousItemsById = previousItems.reduce(
    (acc, s) => ({
      ...acc,
      [s.id]: s,
    }),
    {}
  );
  return currentItems.reduce((acc, s) => {
    if (
      !previousItemsById[s.id] ||
      haveDomainsChanged(previousItemsById[s.id] || {}, s)
    ) {
      return [...acc, s];
    }
    return acc;
  }, []);
};

export const stripPlaceholderDomain = domain => {
  if (isEqual(PLACEHOLDER_DOMAIN, domain)) {
    return undefined;
  }
  return domain;
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
class Scaler extends Component {
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

  constructor(props) {
    super(props);

    this.state = {
      // Map from item (collection, series) to their respective domains.
      domainsByItemId: this.getDomainsByItemId(),

      // Map from item (collection, series) to their respective subdomains.
      subDomainsByItemId: this.getSubDomainsByItemId(),
    };
  }

  componentDidUpdate(prevProps) {
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

      []
        .concat(changedSeries)
        .concat(changedCollections)
        .forEach(item => {
          domainsByItemId[item.id] = {
            [Axes.time]: dataContext.timeDomain || [
              ...(item.timeDomain ||
                stripPlaceholderDomain(Axes.time(oldDomainsByItemId[item.id]))),
            ],
            [Axes.x]: [
              ...(item.xDomain ||
                stripPlaceholderDomain(Axes.x(oldDomainsByItemId[item.id])) ||
                PLACEHOLDER_DOMAIN),
            ],
            [Axes.y]: [
              ...(item.yDomain ||
                stripPlaceholderDomain(Axes.y(oldDomainsByItemId[item.id])) ||
                PLACEHOLDER_DOMAIN),
            ],
          };
          subDomainsByItemId[item.id] = {
            [Axes.time]: dataContext.timeSubDomain || [
              ...(item.timeSubDomain ||
                stripPlaceholderDomain(
                  Axes.time(oldSubDomainsByItemId[item.id])
                )),
            ],
            [Axes.x]: [
              ...(item.xSubDomain ||
                stripPlaceholderDomain(
                  Axes.x(oldSubDomainsByItemId[item.id])
                ) ||
                PLACEHOLDER_DOMAIN),
            ],
            [Axes.y]: [
              ...(item.ySubDomain ||
                stripPlaceholderDomain(
                  Axes.y(oldSubDomainsByItemId[item.id])
                ) ||
                PLACEHOLDER_DOMAIN),
            ],
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
        domainsByItemId[itemId][Axes.time] = nextTimeDomain;
      });

      const subDomainsByItemId = { ...oldSubDomainsByItemId };
      Object.keys(subDomainsByItemId).forEach(itemId => {
        const { [Axes.time]: timeSubDomain } = oldSubDomainsByItemId[itemId];
        subDomainsByItemId[itemId] = {
          ...oldSubDomainsByItemId[itemId],
        };
        const dt = timeSubDomain[1] - timeSubDomain[0];
        if (
          Math.abs((timeSubDomain[1] - prevTimeDomain[1]) / dt) <=
          FRONT_OF_WINDOW_THRESHOLD
        ) {
          // Looking at the front of the window -- continue to track that.
          subDomainsByItemId[itemId][Axes.time] = [
            nextTimeDomain[1] - dt,
            nextTimeDomain[1],
          ];
        } else if (timeSubDomain[0] <= prevTimeDomain[0]) {
          // Looking at the back of the window -- continue to track that.
          subDomainsByItemId[itemId][Axes.time] = [
            prevTimeDomain[0],
            prevTimeDomain[0] + dt,
          ];
        }
      });

      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ domainsByItemId, subDomainsByItemId });

      if (
        !isEqual(prevProps.dataContext.timeSubDomain, dataContext.timeSubDomain)
      ) {
        // When timeSubDomain changes, we need to update everything downstream.
        const newSubDomainsByItemId = {};
        Object.keys(oldSubDomainsByItemId).forEach(itemId => {
          newSubDomainsByItemId[itemId] = {
            ...oldSubDomainsByItemId[itemId],
            [Axes.time]: dataContext.timeSubDomain,
          };
        });
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ subDomainsByItemId: newSubDomainsByItemId });
      }
    }
  }

  getDomainsByItemId = () => {
    const { dataContext } = this.props;
    return []
      .concat(dataContext.series)
      .concat(dataContext.collections)
      .reduce(
        (acc, item) => ({
          ...acc,
          [item.id]: {
            [Axes.time]: [...dataContext.timeDomain],
            [Axes.x]: [...(item.xDomain || PLACEHOLDER_DOMAIN)],
            [Axes.y]: [...(item.yDomain || PLACEHOLDER_DOMAIN)],
          },
        }),
        {}
      );
  };

  getSubDomainsByItemId = () => {
    const { dataContext } = this.props;
    return []
      .concat(dataContext.series)
      .concat(dataContext.collections)
      .reduce(
        (acc, item) => ({
          ...acc,
          [item.id]: {
            [Axes.time]: [...dataContext.timeSubDomain],
            [Axes.x]: [...(item.xSubDomain || PLACEHOLDER_DOMAIN)],
            [Axes.y]: [...(item.ySubDomain || PLACEHOLDER_DOMAIN)],
          },
        }),
        {}
      );
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
  updateDomains = (changedDomainsById, callback) => {
    // FIXME: This is not multi-series aware.
    let newTimeSubDomain = null;

    const { dataContext } = this.props;
    const { domainsByItemId, subDomainsByItemId } = this.state;
    const newSubDomains = { ...subDomainsByItemId };
    Object.keys(changedDomainsById).forEach(itemId => {
      newSubDomains[itemId] = { ...(subDomainsByItemId[itemId] || {}) };
      Object.keys(changedDomainsById[itemId]).forEach(axis => {
        let newSubDomain = changedDomainsById[itemId][axis];
        if (axis === String(Axes.time)) {
          newSubDomain = dataContext.limitTimeSubDomain(newSubDomain);
        }

        const newSpan = newSubDomain[1] - newSubDomain[0];

        const existingSubDomain =
          subDomainsByItemId[itemId][axis] || newSubDomain;
        const existingSpan = existingSubDomain[1] - existingSubDomain[0];

        const limits = stripPlaceholderDomain(
          ((domainsByItemId || {})[itemId] || {})[axis] ||
            (axis === String(Axes.time)
              ? // FIXME: Phase out this single timeDomain thing.
                dataContext.timeDomain
              : undefined)
        ) || [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];

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
    const { children, dataContext } = this.props;

    const finalContext = {
      // Pick what we need out of the dataContext instead of spreading the
      // entire object into the context.
      collections: dataContext.collections,
      series: dataContext.series,

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

export default props => (
  <DataContext.Consumer>
    {dataContext => <Scaler {...props} dataContext={dataContext} />}
  </DataContext.Consumer>
);
