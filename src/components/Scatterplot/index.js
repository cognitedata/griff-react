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
import UnifiedAxis from '../UnifiedAxis';
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

const Y_AXIS_WIDTH = 50;
const X_AXIS_HEIGHT = 50;

const ScatterplotComponent = ({
  grid,
  size: { width, height },
  series,
  zoomable,
  onClick,
  xScalerFactory,
  yAxisPlacement,
  subDomain,
}) => {
  const chartSize = {
    width,
    height: height - X_AXIS_HEIGHT,
  };

  switch (yAxisPlacement) {
    case AxisPlacement.BOTH:
      chartSize.width -= 2 * Y_AXIS_WIDTH;
      break;
    case AxisPlacement.LEFT:
    case AxisPlacement.RIGHT:
    case AxisPlacement.UNSPECIFIED:
    default:
      chartSize.width -= Y_AXIS_WIDTH;
      break;
  }

  return (
    <Layout
      chart={
        <svg style={{ width: '100%', height: '100%' }}>
          <GridLines grid={grid} {...chartSize} />
          <ScaledPointCollection {...chartSize} />
          <InteractionLayer
            {...chartSize}
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
          height={chartSize.height}
          width={Y_AXIS_WIDTH}
        />
      }
      xAxis={
        <XAxis
          domain={subDomain}
          width={chartSize.width}
          height={X_AXIS_HEIGHT}
          xScalerFactory={xScalerFactory}
          tickFormatter={Number}
        />
      }
      yAxisPlacement={yAxisPlacement}
    />
  );
};

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
