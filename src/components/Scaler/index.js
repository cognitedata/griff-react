import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import isEqual from 'lodash.isequal';
import DataContext from '../../context/Data';
import ScalerContext from '../../context/Scaler';
import { createXScale, createYScale } from '../../utils/scale-helpers';
import { seriesPropType } from '../../utils/proptypes';

class Scaler extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    dataContext: PropTypes.shape({
      baseDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
      subDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
      subDomainChanged: PropTypes.func.isRequired,
      series: seriesPropType.isRequired,
    }).isRequired,
  };

  state = {
    yDomains: {},
    subDomain: undefined,
    baseDomain: [0, 0],
    yTransformations: {},
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      dataContext: { baseDomain: nextPropsDomain },
    } = nextProps;
    const { baseDomain: prevStateDomain } = prevState;
    if (
      nextPropsDomain[0] !== prevStateDomain[0] ||
      nextPropsDomain[1] !== prevStateDomain[1]
    ) {
      // TODO: Implement functionality when switching the baseDomain
      // We can try to keep the same subDomain if it exists, clip it etc
      // Currently we snap subDomain back to baseDomain and resets the yDomains
      return {
        baseDomain: nextPropsDomain,
        subDomain: nextPropsDomain,
        yDomains: {},
      };
    }
    return null;
  }

  componentDidUpdate(prevProps) {
    // Can we get away from this double update?
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
      }
    });
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
    const series = this.props.dataContext.series.find(s => s.id === key);
    const newSubDomain = scaler
      .rescaleY(createYScale(series.yDomain, height))
      .domain()
      .map(Number);

    this.setState({
      yDomains: {
        ...this.state.yDomains,
        [key]: newSubDomain,
      },
      yTransformations: {
        ...this.state.yTransformations,
        [key]: scaler,
      },
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
    const enrichedContext = {
      subDomain: subDomain || dataContext.subDomain,
      series: enrichedSeries,
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
