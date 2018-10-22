import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DataContext from '../../context/Data';
import ScalerContext from '../../context/Scaler';
import { createXScale } from '../../utils/scale-helpers';
import GriffPropTypes, { seriesPropType } from '../../utils/proptypes';

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

  state = {
    xSubDomains: {},
    ySubDomains: {},
    timeSubDomain:
      this.props.dataContext.timeSubDomain || this.props.dataContext.timeDomain,

    // Map from item (collection, series) to their respective domains.
    domainsByItemId: {},

    // Map from item (collection, series) to their respective subdomains.
    subDomainsByItemId: {},
  };

  static getDerivedStateFromProps(props, state) {
    const { dataContext } = props;
    const subDomainsByItemId = []
      .concat(dataContext.series)
      .concat(dataContext.collections)
      .reduce(
        (acc, item) => ({
          ...acc,
          [item.id]: state.subDomainsByItemId[item.id] || {
            time: [...dataContext.timeSubDomain],
            x: [...(item.xSubDomain || [])],
            y: [...(item.ySubDomain || [])],
          },
        }),
        {}
      );
    const domainsByItemId = []
      .concat(dataContext.series)
      .concat(dataContext.collections)
      .reduce(
        (acc, item) => ({
          ...acc,
          [item.id]: state.domainsByItemId[item.id] || {
            time: [...dataContext.timeDomain],
            x: [...(item.xDomain || [])],
            y: [...(item.yDomain || [])],
          },
        }),
        {}
      );
    return { subDomainsByItemId, domainsByItemId };
  }

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
          (axis === 'time'
            ? // FIXME: Phase out this timeDomain thing.
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

        if (axis === 'time') {
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
    const {
      domainsByItemId,
      subDomainsByItemId,
      timeSubDomain,
      xSubDomains,
      ySubDomains,
    } = this.state;
    const { dataContext, xScalerFactory } = this.props;
    const ownContext = {
      updateDomains: this.updateDomains,
      domainsByItemId,
      subDomainsByItemId,
    };

    const enrichedSeries = dataContext.series.map(s => ({
      ...s,
      xSubDomain: xSubDomains[s.id] || s.xSubDomain,
      ySubDomain: ySubDomains[s.id] || s.ySubDomain,
    }));

    const enrichedCollections = dataContext.collections.map(c => ({
      ...c,
      xSubDomain: xSubDomains[c.id] || c.xSubDomain,
      ySubDomain: ySubDomains[c.id] || c.ySubDomain,
    }));

    const enrichedContext = {
      collections: enrichedCollections,
      series: enrichedSeries,
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
