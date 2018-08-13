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
      baseDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
      subDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
      externalSubDomain: PropTypes.arrayOf(PropTypes.number),
      subDomainChanged: PropTypes.func.isRequired,
      series: seriesPropType.isRequired,
      collections: GriffPropTypes.collections.isRequired,
    }).isRequired,
  };

  state = {
    yDomains: {},
    subDomain:
      this.props.dataContext.subDomain || this.props.dataContext.baseDomain,
    yTransformations: {},
  };

  componentDidUpdate(prevProps, prevState) {
    // Check every serie if its yDomain changed
    // If so -- update the state
    const yDomains = {};
    this.props.dataContext.series.forEach(s => {
      yDomains[s.id] = s.yDomain;
    });
    const transformUpdate = {};
    const domainUpdate = {};
    prevProps.dataContext.series.forEach(s => {
      if (!isEqual(yDomains[s.id], s.yDomain)) {
        transformUpdate[s.id] = d3.zoomIdentity;
        domainUpdate[s.id] = yDomains[s.id];

        if (s.collectionId) {
          transformUpdate[s.collectionId] = d3.zoomIdentity;
          domainUpdate[s.collectionId] = yDomains[s.id];
        }
      }
    });
    if (
      !isEqual(
        prevProps.dataContext.externalSubDomain,
        this.props.dataContext.externalSubDomain
      )
    ) {
      // eslint-disable-next-line
      this.setState({
        subDomain: this.props.dataContext.externalSubDomain,
      });
    }
    if (
      Object.keys(domainUpdate).length ||
      Object.keys(transformUpdate).length
    ) {
      // eslint-disable-next-line
      this.setState({
        yTransformations: {
          ...this.state.yTransformations,
          ...transformUpdate,
        },
        yDomains: {
          ...this.state.yDomains,
          ...domainUpdate,
        },
      });
    }

    // Handle changes in the base domain of the DataProvider
    const {
      dataContext: {
        baseDomain: nextPropsDomain,
        externalBaseDomain: nextExternalBaseDomain,
      },
    } = this.props;
    const {
      dataContext: {
        baseDomain: prevBaseDomain,
        externalBaseDomain: prevExternalBaseDomain,
      },
    } = prevProps;
    if (!isEqual(prevExternalBaseDomain, nextExternalBaseDomain)) {
      // External base domain changed (props on DataProvider)
      // Reset state

      // eslint-disable-next-line
      this.setState({
        subDomain: nextExternalBaseDomain,
        yDomains: {},
        yTransformations: {},
      });
      return;
    }
    if (
      nextPropsDomain[0] !== prevBaseDomain[0] ||
      nextPropsDomain[1] !== prevBaseDomain[1]
    ) {
      // The internal baseDomain changed
      // Keep existing subdomain
      const { subDomain } = prevState;
      if (subDomain && subDomain[1] === prevBaseDomain[1]) {
        // You are looking at the end of the window
        // and the baseDomain is updated
        // Lock the subDomain to the end of the window
        const dt = subDomain[1] - subDomain[0];
        // eslint-disable-next-line
        this.setState({
          subDomain: [nextPropsDomain[1] - dt, nextPropsDomain[1]],
        });
      }
      if (
        subDomain &&
        (subDomain[0] === prevBaseDomain[0] ||
          subDomain[0] <= nextPropsDomain[0])
      ) {
        // You are looking at the front of the window
        // and the base domain is updated.
        // Lock the sub domain to the start of the window
        const dt = subDomain[1] - subDomain[0];
        // eslint-disable-next-line
        this.setState({
          subDomain: [nextPropsDomain[0], nextPropsDomain[0] + dt],
        });
      }
    }
  }

  updateXTransformation = (xTransformation, width) => {
    const { baseDomain } = this.props.dataContext;
    // Get the new rescaled axis
    const newScale = xTransformation.rescaleX(createXScale(baseDomain, width));
    // Calculate new domain, map to timestamps (not dates)
    const newDomain = newScale.domain().map(Number);
    // Update dataproviders subdomains changed
    this.setState({
      subDomain: newDomain,
    });
    this.props.dataContext.subDomainChanged(newDomain);
  };

  updateSubDomain = subDomain => {
    this.setState(
      {
        subDomain,
      },
      () => {
        this.props.dataContext.subDomainChanged(subDomain);
      }
    );
  };

  updateYTransformation = (key, scaler, height) => {
    const { dataContext } = this.props;

    const { yDomain } =
      dataContext.series.find(s => s.id === key) ||
      dataContext.collections.find(c => c.id === key);
    const newSubDomain = scaler
      .rescaleY(createYScale(yDomain, height))
      .domain()
      .map(Number);

    this.setState({
      yDomains: { ...this.state.yDomains, [key]: newSubDomain },
      yTransformations: { ...this.state.yTransformations, [key]: scaler },
    });
  };

  render() {
    const { yDomains, yTransformations, subDomain } = this.state;
    const { dataContext } = this.props;
    const ownContext = {
      updateXTransformation: this.updateXTransformation,
      updateSubDomain: this.updateSubDomain,
      updateYTransformation: this.updateYTransformation,
      yTransformations,
    };

    const enrichedSeries = dataContext.series.map(s => ({
      ...s,
      yDomain: yDomains[s.id] || s.yDomain,
    }));

    const enrichedCollections = dataContext.collections.map(c => ({
      ...c,
      yDomain: yDomains[c.id] || c.yDomain,
    }));

    const enrichedContext = {
      subDomain: subDomain || dataContext.subDomain,
      series: enrichedSeries,
      collections: enrichedCollections,
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
