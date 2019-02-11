import React from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import Scaler from '../Scaler';
import ScalerContext from '../../context/Scaler';
import PointCollection from '../PointCollection';
import InteractionLayer, { ZoomMode } from '../InteractionLayer';
import GriffPropTypes, { seriesPropType } from '../../utils/proptypes';
import XAxis from '../XAxis';
import Layout from './Layout';
import AxisPlacement from '../AxisPlacement';
import Axes from '../../utils/Axes';
import AxisCollection from '../AxisCollection';
import LineCollection from '../LineCollection';
import AxisDisplayMode from '../LineChart/AxisDisplayMode';

const propTypes = {
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
  // Number => String
  yAxisFormatter: PropTypes.func,
  yAxisPlacement: GriffPropTypes.axisPlacement,
  yAxisTicks: PropTypes.number,
  collections: GriffPropTypes.collections.isRequired,
  series: seriesPropType.isRequired,

  // The following props are all supplied internally (eg, by React).
  children: PropTypes.arrayOf(PropTypes.node),
};

const defaultProps = {
  zoomable: true,
  onClick: null,
  xAxisFormatter: Number,
  xAxisPlacement: AxisPlacement.BOTTOM,
  xAxisTicks: null,
  yAxisFormatter: Number,
  yAxisPlacement: AxisPlacement.RIGHT,
  yAxisTicks: null,

  children: [],
};

const Y_AXIS_WIDTH = 50;
const X_AXIS_HEIGHT = 50;

const getYAxisPlacement = ({ collections, series, yAxisPlacement }) => {
  const yAxisPlacements = []
    .concat(series.filter(s => s.collectionId === undefined))
    .concat(collections)
    .reduce((acc, item) => {
      const placement = item.yAxisPlacement || yAxisPlacement;
      if (placement) {
        acc[placement] = (acc[placement] || 0) + 1;
      }
      return acc;
    }, {});
  if (yAxisPlacements[AxisPlacement.BOTH]) {
    return AxisPlacement.BOTH;
  }
  if (
    yAxisPlacements[AxisPlacement.LEFT] &&
    yAxisPlacements[AxisPlacement.RIGHT]
  ) {
    return AxisPlacement.BOTH;
  }
  if (yAxisPlacements[AxisPlacement.LEFT]) {
    return AxisPlacement.LEFT;
  }
  return yAxisPlacement || AxisPlacement.RIGHT;
};

const ScatterplotComponent = ({
  children,
  collections,
  series,
  size: { width, height },
  zoomable,
  onClick,
  xAxisFormatter,
  xAxisPlacement,
  xAxisTicks,
  yAxisFormatter,
  yAxisPlacement: propsYAxisPlacement,
  yAxisTicks,
}) => {
  const chartSize = {
    width,
    height,
  };

  const collectionVisibility = collections.reduce(
    (acc, c) => ({
      ...acc,
      // Will this collection have its own axis?
      [c.id]: !c.hidden && c.yAxisDisplayMode !== AxisDisplayMode.NONE,
    }),
    {}
  );

  const seriesVisibility = series.reduce(
    (acc, s) => ({
      ...acc,
      // Will this series have its own axis?
      [s.id]:
        // If it's hidden, it won't have an axis.
        !s.hidden &&
        // If it has a non-hidden axis, it will not have an axis.
        s.yAxisDisplayMode !== AxisDisplayMode.NONE &&
        // If it's in a collection, it gets special behavior ...
        ((s.collectionId &&
          // If it's in an unknown collection, it will have an axis.
          collectionVisibility[s.collectionId] === undefined) ||
          // And if it's not in a collection, it gets its own axis
          s.collectionId === undefined),
    }),
    {}
  );

  const visibleAxes = Object.values(seriesVisibility)
    .concat(Object.values(collectionVisibility))
    .filter(Boolean).length;

  const yAxisPlacement = getYAxisPlacement({
    collections,
    series,
    propsYAxisPlacement,
  });

  chartSize.width -= visibleAxes * Y_AXIS_WIDTH;

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
          {React.Children.map(children, child => {
            const childProps = {
              ...chartSize,
              axes: {
                ...(child.props || {}).axes,
                [Axes.x]:
                  ((child.props || {}).axes || {}).x === undefined
                    ? String(Axes.x)
                    : child.props.axes.x,
              },
            };
            return React.cloneElement(child, childProps);
          })}
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
  <Scaler>
    <ScalerContext.Consumer>
      {({ collections, series }) => (
        <SizedScatterplotComponent
          {...props}
          collections={collections}
          series={series}
        />
      )}
    </ScalerContext.Consumer>
  </Scaler>
);

export default Scatterplot;
