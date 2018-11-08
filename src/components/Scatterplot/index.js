import React from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import Scaler from '../Scaler';
import ScalerContext from '../../context/Scaler';
import PointCollection from '../PointCollection';
import InteractionLayer, { ZoomMode } from '../InteractionLayer';
import { createLinearXScale } from '../../utils/scale-helpers';
import GriffPropTypes, {
  seriesPropType,
  scalerFactoryFunc,
} from '../../utils/proptypes';
import XAxis from '../XAxis';
import Layout from './Layout';
import AxisPlacement from '../AxisPlacement';
import GridLines from '../GridLines';
import Axes from '../../utils/Axes';
import AxisCollection from '../AxisCollection';
import LineCollection from '../LineCollection';
import AxisDisplayMode from '../LineChart/AxisDisplayMode';

const propTypes = {
  grid: GriffPropTypes.grid,
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  zoomable: PropTypes.bool,
  onClick: PropTypes.func,
  // Number => String
  xAxisFormatter: PropTypes.func,
  xAxisPlacement: GriffPropTypes.axisPlacement,
  xAxisTicks: PropTypes.number,
  xScalerFactory: scalerFactoryFunc.isRequired,
  // Number => String
  yAxisFormatter: PropTypes.func,
  yAxisPlacement: GriffPropTypes.axisPlacement,
  yAxisTicks: PropTypes.number,
  collections: GriffPropTypes.collections.isRequired,
  series: seriesPropType.isRequired,
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
  collections,
  grid,
  series,
  size: { width, height },
  zoomable,
  onClick,
  xAxisFormatter,
  xAxisPlacement,
  xAxisTicks,
  xScalerFactory,
  yAxisFormatter,
  yAxisPlacement,
  yAxisTicks,
}) => {
  const chartSize = {
    width,
    height,
  };

  const { collectionIds, visibleCollections } = collections.reduce(
    (info, c) => {
      let { visibleCollections: updatedVisibleCollections } = info;
      if (!c.hidden && c.yAxisDisplayMode !== AxisDisplayMode.NONE) {
        updatedVisibleCollections += 1;
      }
      return {
        collectionIds: {
          ...info.collectionIds,
          [c.id]: true,
        },
        updatedVisibleCollections,
      };
    },
    { collectionIds: {}, visibleCollections: 0 }
  );

  const visibleAxes = series.reduce((total, s) => {
    if (s.hidden) {
      return total;
    }
    if (s.collectionId && collectionIds[s.collectionId]) {
      return total;
    }
    if (s.yAxisDisplayMode === AxisDisplayMode.NONE) {
      return total;
    }
    return total + 1;
  }, visibleCollections);

  switch (yAxisPlacement) {
    case AxisPlacement.BOTH:
      chartSize.width -= 2 * visibleAxes * Y_AXIS_WIDTH;
      break;
    default:
      chartSize.width -= visibleAxes * Y_AXIS_WIDTH;
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
          <PointCollection {...chartSize} />
          <LineCollection
            {...chartSize}
            series={series.filter(s => !!s.drawLines)}
            xAxis={Axes.x}
          />
          <InteractionLayer
            {...chartSize}
            onClick={onClick}
            zoomMode={ZoomMode.BOTH}
            xScalerFactory={xScalerFactory}
            zoomAxes={{ x: zoomable, y: zoomable }}
          />
        </svg>
      }
      yAxis={
        <AxisCollection
          tickFormatter={yAxisFormatter}
          yAxisPlacement={yAxisPlacement}
          height={chartSize.height}
          width={Y_AXIS_WIDTH}
          ticks={yAxisTicks}
        />
      }
      xAxis={
        <XAxis
          width={chartSize.width}
          height={X_AXIS_HEIGHT}
          xScalerFactory={xScalerFactory}
          tickFormatter={xAxisFormatter}
          ticks={xAxisTicks}
          axis={Axes.x}
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
      {({ collections, series, xScalerFactory }) => (
        <SizedScatterplotComponent
          {...props}
          collections={collections}
          series={series}
          xScalerFactory={xScalerFactory}
        />
      )}
    </ScalerContext.Consumer>
  </Scaler>
);

export default Scatterplot;
