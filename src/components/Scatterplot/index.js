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
  // Number => String
  xAxisFormatter: PropTypes.func,
  xAxisPlacement: GriffPropTypes.axisPlacement,
  xAxisTicks: PropTypes.number,
  xScalerFactory: scalerFactoryFunc.isRequired,
  subDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
  // Number => String
  yAxisFormatter: PropTypes.func,
  yAxisPlacement: GriffPropTypes.axisPlacement,
  yAxisTicks: PropTypes.number,
};

const defaultProps = {
  grid: null,
  zoomable: true,
  onClick: null,
  xAxisFormatter: Number,
  xAxisPlacement: AxisPlacement.BOTTOM,
  xAxisTicks: null,
  yAxisFormatter: Number,
  yAxisPlacement: AxisPlacement.RIGHT,
  yAxisTicks: null,
};

const Y_AXIS_WIDTH = 50;
const X_AXIS_HEIGHT = 50;

const ScatterplotComponent = ({
  grid,
  size: { width, height },
  series,
  zoomable,
  onClick,
  xAxisFormatter,
  xAxisPlacement,
  xAxisTicks,
  xScalerFactory,
  yAxisFormatter,
  yAxisPlacement,
  yAxisTicks,
  subDomain,
}) => {
  const chartSize = {
    width,
    height,
  };

  switch (yAxisPlacement) {
    case AxisPlacement.BOTH:
      chartSize.width -= 2 * Y_AXIS_WIDTH;
      break;
    default:
      chartSize.width -= Y_AXIS_WIDTH;
      break;
  }

  switch (xAxisPlacement) {
    case AxisPlacement.BOTH:
      chartSize.height -= 2 * X_AXIS_HEIGHT;
      break;
    default:
      chartSize.height -= X_AXIS_HEIGHT;
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
          tickFormatter={yAxisFormatter}
          yAxisPlacement={yAxisPlacement}
          series={series}
          height={chartSize.height}
          width={Y_AXIS_WIDTH}
          ticks={yAxisTicks}
        />
      }
      xAxis={
        <XAxis
          domain={subDomain}
          width={chartSize.width}
          height={X_AXIS_HEIGHT}
          xScalerFactory={xScalerFactory}
          tickFormatter={xAxisFormatter}
          ticks={xAxisTicks}
        />
      }
      xAxisPlacement={xAxisPlacement}
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
