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
    subDomainsByItemId: {},
  };

  static getDerivedStateFromProps(props, state) {
    const { dataContext } = props;
    const subDomainsByItemId = []
      .concat(dataContext.series.filter(s => s.collectionId === undefined))
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
    return { subDomainsByItemId };
  }

  componentDidUpdate_old(prevProps, prevState) {
    // Check every serie if its ySubDomain changed
    // If so -- update the state
    const ySubDomains = {};
    this.props.dataContext.series.forEach(s => {
      ySubDomains[s.id] = s.ySubDomain;
    });
    const transformUpdate = {};
    const domainUpdate = {};
    prevProps.dataContext.series.forEach(s => {
      if (!isEqual(ySubDomains[s.id], s.ySubDomain)) {
        transformUpdate[s.id] = d3.zoomIdentity;
        domainUpdate[s.id] = ySubDomains[s.id];

        if (s.collectionId) {
          transformUpdate[s.collectionId] = d3.zoomIdentity;
          domainUpdate[s.collectionId] = ySubDomains[s.id];
        }
      }
    });

    if (
      !isEqual(
        prevProps.dataContext.xSubDomain,
        this.props.dataContext.xSubDomain
      )
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ xSubDomain: this.props.dataContext.xSubDomain });
    }

    if (
      !isEqual(
        prevProps.dataContext.externalXSubDomain,
        this.props.dataContext.externalXSubDomain
      )
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        xSubDomain: this.props.dataContext.externalXSubDomain,
      });
    }

    if (
      Object.keys(domainUpdate).length ||
      Object.keys(transformUpdate).length
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        yTransformations: {
          ...this.state.yTransformations,
          ...transformUpdate,
        },
        ySubDomains: {
          ...this.state.ySubDomains,
          ...domainUpdate,
        },
      });
    }

    // Handle changes in the base domain of the DataProvider
    const {
      dataContext: {
        xDomain: nextPropsDomain,
        externalXDomain: nextExternalXDomain,
      },
    } = this.props;
    const {
      dataContext: {
        xDomain: prevXDomain,
        externalXDomain: prevExternalXDomain,
      },
    } = prevProps;
    if (!isEqual(prevExternalXDomain, nextExternalXDomain)) {
      // External base domain changed (props on DataProvider)
      // Reset state
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        xSubDomain: nextExternalXDomain,
        ySubDomains: {},
        yTransformations: {},
      });
      return;
    }
    if (
      nextPropsDomain[0] !== prevXDomain[0] ||
      nextPropsDomain[1] !== prevXDomain[1]
    ) {
      // The internal xDomain changed
      // Keep existing subdomain
      const { xSubDomain } = prevState;
      if (
        xSubDomain &&
        (xSubDomain[1] === prevXDomain[1] || xSubDomain[1] >= prevXDomain[1])
      ) {
        // You are looking at the end of the window
        // and the xDomain is updated
        // Lock the xSubDomain to the end of the window
        const dt = xSubDomain[1] - xSubDomain[0];
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({
          xSubDomain: [nextPropsDomain[1] - dt, nextPropsDomain[1]],
        });
      }
      if (
        xSubDomain &&
        (xSubDomain[0] === prevXDomain[0] ||
          xSubDomain[0] <= nextPropsDomain[0])
      ) {
        // You are looking at the front of the window
        // and the base domain is updated.
        // Lock the sub domain to the start of the window
        const dt = xSubDomain[1] - xSubDomain[0];
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({
          xSubDomain: [nextPropsDomain[0], nextPropsDomain[0] + dt],
        });
      }
    }
  }

  updateXTransformation = (xTransformation, width) => {
    const { xDomain } = this.props.dataContext;
    const { xScalerFactory } = this.props;
    // Get the new rescaled axis
    const newScale = xTransformation.rescaleX(xScalerFactory(xDomain, width));
    // Calculate new domain, map to timestamps (not dates)
    const newXSubDomain = newScale.domain().map(Number);
    // Update DataProvider's xSubDomain
    // No need to set new xSubDomain state here since we
    // listen for xSubDomain change in componentDidUpdate.
    this.props.dataContext.xSubDomainChanged(newXSubDomain);
    return newXSubDomain;
  };

  updateXSubDomain = xSubDomain => {
    this.setState(
      {
        xSubDomain,
      },
      () => {
        this.props.dataContext.xSubDomainChanged(xSubDomain);
      }
    );
  };

  updateYTransformation = (key, scaler, height) => {
    const { dataContext } = this.props;

    const { ySubDomain } =
      dataContext.series.find(s => s.id === key) ||
      dataContext.collections.find(c => c.id === key);
    const newXSubDomain = scaler
      .rescaleY(createYScale(ySubDomain, height))
      .domain()
      .map(Number);

    this.setState({
      ySubDomains: { ...this.state.ySubDomains, [key]: newXSubDomain },
      yTransformations: { ...this.state.yTransformations, [key]: scaler },
    });

    return newXSubDomain;
  };

  updateDomains = (changedDomainsById, callback) => {
    const subDomainsByItemId = Object.keys(changedDomainsById).reduce(
      (changes, itemId) => ({
        ...changes,
        [itemId]: {
          ...this.state.subDomainsByItemId[itemId],
          ...changedDomainsById[itemId],
        },
      }),
      this.state.subDomainsByItemId
    );
    this.setState(
      { subDomainsByItemId },
      callback ? () => callback(changedDomainsById) : undefined
    );
  };

  render() {
    const {
      subDomainsByItemId,
      ySubDomains,
      yTransformations,
      xSubDomain,
    } = this.state;
    const { dataContext, xScalerFactory } = this.props;
    const ownContext = {
      updateXTransformation: this.updateXTransformation,
      updateXSubDomain: this.updateXSubDomain,
      updateYTransformation: this.updateYTransformation,
      yTransformations,
      updateDomains: this.updateDomains,
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
