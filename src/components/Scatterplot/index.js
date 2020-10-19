import React from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import { ScalerContext } from '@cognite/react-griff-provider';
import PointCollection from 'components/PointCollection';
import InteractionLayer, { ZoomMode } from 'components/InteractionLayer';
import GriffPropTypes, { seriesPropType } from 'utils/proptypes';
import XAxis from 'components/XAxis';
import AxisPlacement from 'components/AxisPlacement';
import Axes from 'utils/Axes';
import AxisCollection from 'components/AxisCollection';
import LineCollection from 'components/LineCollection';
import AxisDisplayMode from 'utils/AxisDisplayMode';
import { withDisplayName } from 'utils/displayName';
import Layout from './Layout';

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
  xAxisHeight: PropTypes.number,
  yAxisWidth: PropTypes.number,

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
  xAxisHeight: 50,
  yAxisWidth: 50,

  children: [],
};

const getYAxisPlacement = ({ collections, series, yAxisPlacement }) => {
  const yAxisPlacements = series
    .filter(s => s.collectionId === undefined)
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
  xAxisHeight,
  yAxisWidth,
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
    yAxisPlacement: propsYAxisPlacement,
  });

  chartSize.width -= visibleAxes * yAxisWidth;

  switch (xAxisPlacement) {
    case AxisPlacement.BOTH:
      chartSize.height -= 2 * xAxisHeight;
      break;
    default:
      chartSize.height -= xAxisHeight;
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
          yAxisWidth={yAxisWidth}
          ticks={yAxisTicks}
        />
      }
      xAxis={
        <XAxis
          width={chartSize.width}
          height={xAxisHeight}
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

export default withDisplayName('Scatterplot', props => (
  <ScalerContext.Consumer>
    {({ collections, series }) => (
      <SizedScatterplotComponent
        {...props}
        collections={collections}
        series={series}
      />
    )}
  </ScalerContext.Consumer>
));
