import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import isEqual from 'lodash.isequal';
import DataContext from '../../context/Data';
import ScalerContext from '../../context/Scaler';
import { createXScale, createYScale } from '../../utils/scale-helpers';
import GriffPropTypes, { seriesPropType } from '../../utils/proptypes';

class Scaler extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    dataContext: PropTypes.shape({
      xDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
      xSubDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
      externalXSubDomain: PropTypes.arrayOf(PropTypes.number),
      xSubDomainChanged: PropTypes.func.isRequired,
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
    ySubDomains: {},
    xSubDomain:
      this.props.dataContext.xSubDomain || this.props.dataContext.xDomain,
    yTransformations: {},

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
            x: [...dataContext.xSubDomain],
            y: [...item.ySubDomain],
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
            x: [...dataContext.xDomain],
            y: [...item.yDomain],
          },
        }),
        {}
      );
    return { subDomainsByItemId, domainsByItemId };
  }

  updateDomains = (changedDomainsById, callback) => {
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

        const limits =
          ((domainsById || {})[itemId] || {})[axis] || axis === 'x'
            ? // FIXME: Phase out this xDomain thing.
              this.props.dataContext.xDomain
            : undefined || [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];

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
      });
    });
    this.setState(
      { subDomainsByItemId: newSubDomains },
      callback ? () => callback(changedDomainsById) : undefined
    );
  };

  render() {
    const {
      domainsByItemId,
      subDomainsByItemId,
      ySubDomains,
      xSubDomain,
    } = this.state;
    const { dataContext, xScalerFactory } = this.props;
    const ownContext = {
      updateDomains: this.updateDomains,
      domainsByItemId,
      subDomainsByItemId,
    };

    const enrichedSeries = dataContext.series.map(s => ({
      ...s,
      ySubDomain: ySubDomains[s.id] || s.ySubDomain,
    }));

    const enrichedCollections = dataContext.collections.map(c => ({
      ...c,
      ySubDomain: ySubDomains[c.id] || c.ySubDomain,
    }));

    const enrichedContext = {
      collections: enrichedCollections,
      series: enrichedSeries,
      xSubDomain: xSubDomain || dataContext.xSubDomain,
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
