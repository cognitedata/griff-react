import React from 'react';
import PropTypes from 'prop-types';
import Scaler from '../Scaler';
import ScalerContext from '../../context/Scaler';
import { ScaledPointCollection } from '../PointCollection';
import InteractionLayer, { ZoomMode } from '../InteractionLayer';
import { createLinearXScale } from '../../utils/scale-helpers';
import { seriesPropType, scalerFactoryFunc } from '../../utils/proptypes';
import UnifiedAxis from '../UnifedAxis';

const propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  zoomable: PropTypes.bool,
  onClick: PropTypes.func,
  series: seriesPropType.isRequired,
  xScalerFactory: scalerFactoryFunc.isRequired,
};

const defaultProps = {
  zoomable: true,
  onClick: null,
};

const ScatterplotComponent = ({
  width,
  height,
  series,
  zoomable,
  onClick,
  xScalerFactory,
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gridTemplateRows: 'auto 1fr',
    }}
  >
    <svg width={width} height={height}>
      <ScaledPointCollection height={height} width={width} />
      <InteractionLayer
        height={height}
        width={width}
        zoomable={zoomable}
        onClick={onClick}
        zoomMode={ZoomMode.BOTH}
        xScalerFactory={xScalerFactory}
      />
    </svg>
    <UnifiedAxis series={series} height={height} width={100} />
  </div>
);

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
