import React from 'react';
import PropTypes from 'prop-types';
import Scaler from '../Scaler';
import ScalerContext from '../../context/Scaler';
import { ScaledPointCollection } from '../PointCollection';
import InteractionLayer from '../InteractionLayer';
import { createLinearXScale } from '../../utils/scale-helpers';

const propTypes = {};

const defaultProps = {};

class ScatterplotComponent extends React.Component {
  state = {};

  render() {
    const { width, height, zoomable, onClick, subDomain } = this.props;
    return (
      <svg width={width} height={height}>
        <ScaledPointCollection height={height} width={width} />
        <InteractionLayer
          height={height}
          width={width}
          zoomable={zoomable}
          onClick={onClick}
        />
      </svg>
    );
  }
}

ScatterplotComponent.propTypes = propTypes;
ScatterplotComponent.defaultProps = defaultProps;

const Scatterplot = props => (
  <Scaler xScalerFactory={createLinearXScale}>
    <ScalerContext.Consumer>
      {({ series, subDomain, xScalerFactory }) => (
        <ScatterplotComponent
          {...props}
          series={series}
          subDomain={subDomain}
          xScalerFactory={xScalerFactory}
        />
      )}
    </ScalerContext.Consumer>
  </Scaler>
);

export default Scatterplot;
