import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';
import DataContext from '../../context/Data';
import ScalerContext from '../../context/Scaler';
import { createXScale } from '../../utils/scale-helpers';
import GriffPropTypes, { seriesPropType } from '../../utils/proptypes';
import Axes from '../../utils/Axes';

// If the timeSubDomain is within this margin, consider it to be attached to
// the leading edge of the timeDomain.
const FRONT_OF_WINDOW_THRESHOLD = 0.05;

/**
 * The scaler is the source of truth for all things related to the domains and
 * subdomains for all of the items within Griff. Note that an item can be either
 * a series or a collection, and domains are flexible. As of this writing, there
 * are three axes:
 *   time: The timestamp of a datapoint
 *   x: The x-value of a datapoint
 *   y: THe y-value of a datapoint.
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
      externalXSubDomain: PropTypes.arrayOf(PropTypes.number),
      series: seriesPropType.isRequired,
      collections: GriffPropTypes.collections.isRequired,
    }).isRequired,
    // (domain, width) => [number, number]
    xScalerFactory: PropTypes.func,
  };

  static defaultProps = {
    xScalerFactory: createXScale,
  };

  constructor(props) {
    super(props);

    this.state = {
      timeSubDomain:
        this.props.dataContext.timeSubDomain ||
        this.props.dataContext.timeDomain,

      // Map from item (collection, series) to their respective domains.
      domainsByItemId: {},

      // Map from item (collection, series) to their respective subdomains.
      subDomainsByItemId: {},
    };
    const domainsByItemId = this.getDomainsByItemId();
    const subDomainsByItemId = this.getSubDomainsByItemId();

    this.state.domainsByItemId = domainsByItemId;
    this.state.subDomainsByItemId = subDomainsByItemId;
  }

  componentDidUpdate(prevProps) {
    if (
      !isEqual(
        prevProps.dataContext.timeSubDomain,
        this.props.dataContext.timeSubDomain
      )
    ) {
      // When timeSubDomain changes, we need to update everything downstream.
      const subDomainsByItemId = { ...this.state.subDomainsByItemId };
      Object.keys(subDomainsByItemId).forEach(itemId => {
        subDomainsByItemId[itemId][
          Axes.time
        ] = this.props.dataContext.timeSubDomain;
      });
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ subDomainsByItemId });
    }

    if (
      !isEqual(
        prevProps.dataContext.timeDomain,
        this.props.dataContext.timeDomain
      )
    ) {
      // When timeDomain changes, we need to update everything downstream.
      const domainsByItemId = { ...this.state.domainsByItemId };
      Object.keys(domainsByItemId).forEach(itemId => {
        domainsByItemId[itemId][Axes.time] = this.props.dataContext.timeDomain;
      });
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ domainsByItemId });
    }

    if (!isEqual(prevProps.dataContext.series, this.props.dataContext.series)) {
      const domainsByItemId = {};
      const subDomainsByItemId = {};
      []
        .concat(this.props.dataContext.series)
        .concat(this.props.dataContext.collections)
        .forEach(item => {
          domainsByItemId[item.id] = {
            ...this.state.domainsByItemId[item.id],
            [Axes.x]: [
              ...(item.xDomain || Axes.x(this.state.domainsByItemId[item.id])),
            ],
            [Axes.y]: [
              ...(item.yDomain || Axes.y(this.state.domainsByItemId[item.id])),
            ],
          };
          subDomainsByItemId[item.id] = {
            ...this.state.subDomainsByItemId[item.id],
            [Axes.x]: [
              ...(item.xSubDomain ||
                Axes.x(this.state.subDomainsByItemId[item.id])),
            ],
            [Axes.y]: [
              ...(item.ySubDomain ||
                Axes.y(this.state.subDomainsByItemId[item.id])),
            ],
          };
        });
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ subDomainsByItemId, domainsByItemId });
    }

    // Handle changes in the base domain of the DataProvider
    const {
      dataContext: { timeDomain: nextPropsDomain },
    } = this.props;
    const {
      dataContext: { timeDomain: prevTimeDomain },
    } = prevProps;

    if (
      nextPropsDomain[0] !== prevTimeDomain[0] ||
      nextPropsDomain[1] !== prevTimeDomain[1]
    ) {
      const subDomainsByItemId = {};
      []
        .concat(this.props.dataContext.series)
        .concat(this.props.dataContext.collections)
        .forEach(item => {
          const { [Axes.time]: timeSubDomain } = this.state.subDomainsByItemId[
            item.id
          ];
          subDomainsByItemId[item.id] = {
            ...this.state.subDomainsByItemId[item.id],
          };
          const dt = timeSubDomain[1] - timeSubDomain[0];
          if (
            Math.abs((timeSubDomain[1] - prevTimeDomain[1]) / dt) <=
            FRONT_OF_WINDOW_THRESHOLD
          ) {
            // Looking at the front of the window -- continue to track that.
            subDomainsByItemId[item.id][Axes.time] = [
              nextPropsDomain[1] - dt,
              nextPropsDomain[1],
            ];
          } else if (timeSubDomain[0] <= prevTimeDomain[0]) {
            // Looking at the back of the window -- continue to track that.
            subDomainsByItemId[item.id][Axes.time] = [
              prevTimeDomain[0],
              prevTimeDomain[0] + dt,
            ];
          }
        });
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ subDomainsByItemId });
    }
  }

  getDomainsByItemId = () => {
    const { dataContext } = this.props;

    const domainsByItemId = []
      .concat(dataContext.series)
      .concat(dataContext.collections)
      .reduce(
        (acc, item) => ({
          ...acc,
          [item.id]: this.state.domainsByItemId[item.id] || {
            time: [...dataContext.timeDomain],
            x: [...(item.xDomain || [])],
            y: [...(item.yDomain || [])],
          },
        }),
        {}
      );
    return domainsByItemId;
  };

  getSubDomainsByItemId = () => {
    const { dataContext } = this.props;

    const subDomainsByItemId = []
      .concat(dataContext.series)
      .concat(dataContext.collections)
      .reduce(
        (acc, item) => ({
          ...acc,
          [item.id]: this.state.subDomainsByItemId[item.id] || {
            [Axes.time]: [...dataContext.timeSubDomain],
            [Axes.x]: [...(item.xDomain || item.xSubDomain || [])],
            [Axes.y]: [...(item.yDomain || item.ySubDomain || [])],
          },
        }),
        {}
      );
    return subDomainsByItemId;
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

    const { domainsById, subDomainsByItemId } = this.state;
    const newSubDomains = { ...subDomainsByItemId };
    Object.keys(changedDomainsById).forEach(itemId => {
      newSubDomains[itemId] = { ...(subDomainsByItemId[itemId] || {}) };
      Object.keys(changedDomainsById[itemId]).forEach(axis => {
        let newSubDomain = changedDomainsById[itemId][axis];
        const newSpan = newSubDomain[1] - newSubDomain[0];

        const existingSubDomain =
          subDomainsByItemId[itemId][axis] || newSubDomain;
        const existingSpan = existingSubDomain[1] - existingSubDomain[0];

        const limits = ((domainsById || {})[itemId] || {})[axis] ||
          (axis === String(Axes.time)
            ? // FIXME: Phase out this single timeDomain thing.
              this.props.dataContext.timeDomain
            : undefined) || [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];

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
    this.setState(
      { subDomainsByItemId: newSubDomains },
      callback ? () => callback(changedDomainsById) : undefined
    );
    if (newTimeSubDomain) {
      this.props.dataContext.timeSubDomainChanged(newTimeSubDomain);
    }
  };

  render() {
    const { domainsByItemId, subDomainsByItemId, timeSubDomain } = this.state;
    const { dataContext, xScalerFactory } = this.props;
    const ownContext = {
      updateDomains: this.updateDomains,
      domainsByItemId,
      subDomainsByItemId,
    };

    const enrichedContext = {
      collections: dataContext.collections,
      series: dataContext.series,
      timeSubDomain: timeSubDomain || dataContext.timeSubDomain,
      xScalerFactory,
    };

    const finalContext = {
      ...dataContext,
      ...enrichedContext,
      ...ownContext,
    };

    return (
      <ScalerContext.Provider value={finalContext}>
        {this.props.children}
      </ScalerContext.Provider>
    );
  }
}

export default props => (
  <DataContext.Consumer>
    {dataContext => <Scaler {...props} dataContext={dataContext} />}
  </DataContext.Consumer>
);
