import React from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import Scaler from '../Scaler';
import ScalerContext from '../../context/Scaler';
import { ScaledPointCollection } from '../PointCollection';
import InteractionLayer, { ZoomMode } from '../InteractionLayer';
import { createLinearXScale } from '../../utils/scale-helpers';
import { seriesPropType, scalerFactoryFunc } from '../../utils/proptypes';
import UnifiedAxis from '../UnifedAxis';
import XAxis from '../XAxis';

const propTypes = {
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  zoomable: PropTypes.bool,
  onClick: PropTypes.func,
  series: seriesPropType.isRequired,
  xScalerFactory: scalerFactoryFunc.isRequired,
  subDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
};

const defaultProps = {
  zoomable: true,
  onClick: null,
};

const ScatterplotComponent = ({
  size: { width, height },
  series,
  zoomable,
  onClick,
  xScalerFactory,
  subDomain,
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gridTemplateRows: 'auto 1fr',
      height: '100%',
      width: '100%',
    }}
  >
    <svg style={{ width: '100%', height: '100%' }}>
      <ScaledPointCollection height={height - 50} width={width} />
      <InteractionLayer
        height={height - 50}
        width={width}
        zoomable={zoomable}
        onClick={onClick}
        zoomMode={ZoomMode.BOTH}
        xScalerFactory={xScalerFactory}
      />
    </svg>
    <UnifiedAxis series={series} height={height - 50} width={100} />
    <div className="x-axis-container" style={{ width: '100%' }}>
      <XAxis
        domain={subDomain}
        width={width}
        xScalerFactory={xScalerFactory}
        tickFormatter={Number}
      />
    </div>
    <div />
  </div>
);

ScatterplotComponent.propTypes = propTypes;
ScatterplotComponent.defaultProps = defaultProps;

const SizedScatterplotComponent = sizeMe({
  monitorHeight: true,
})(ScatterplotComponent);

const Scatterplot = props => (
  <Scaler xScalerFactory={createLinearXScale}>
    <ScalerContext.Consumer>
      {({ series, subDomain, xScalerFactory }) => (
        <SizedScatterplotComponent
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
