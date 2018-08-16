import React from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import Scaler from '../Scaler';
import ScalerContext from '../../context/Scaler';
import { ScaledPointCollection } from '../PointCollection';
import InteractionLayer, { ZoomMode } from '../InteractionLayer';
import { createLinearXScale } from '../../utils/scale-helpers';
import GriffPropTypes, {
  seriesPropType,
  scalerFactoryFunc,
  axisPlacementType,
} from '../../utils/proptypes';
import UnifiedAxis from '../UnifedAxis';
import XAxis from '../XAxis';
import Layout from './Layout';
import AxisPlacement from '../AxisPlacement';
import GridLines from '../GridLines';

const propTypes = {
  grid: GriffPropTypes.grid,
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  zoomable: PropTypes.bool,
  onClick: PropTypes.func,
  series: seriesPropType.isRequired,
  xScalerFactory: scalerFactoryFunc.isRequired,
  subDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
  yAxisPlacement: axisPlacementType,
};

const defaultProps = {
  grid: null,
  zoomable: true,
  onClick: null,
  yAxisPlacement: AxisPlacement.RIGHT,
};

const ScatterplotComponent = ({
  grid,
  size: { width, height },
  series,
  zoomable,
  onClick,
  xScalerFactory,
  yAxisPlacement,
  subDomain,
}) => (
  <Layout
    chart={
      <svg style={{ width: '100%', height: '100%' }}>
        <GridLines grid={grid} height={height} width={width} />
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
    }
    yAxis={
      <UnifiedAxis
        yAxisPlacement={yAxisPlacement}
        series={series}
        height={height - 50}
        width={100}
      />
    }
    xAxis={
      <XAxis domain={subDomain} width={width} xScalerFactory={xScalerFactory} />
    }
    yAxisPlacement={yAxisPlacement}
  />
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
