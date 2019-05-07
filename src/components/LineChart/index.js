import React from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import AxisCollection from '../AxisCollection';
import ScalerContext from '../../context/Scaler';
import ContextChart from '../ContextChart';
import GriffPropTypes, {
  areaPropType,
  annotationPropType,
  rulerPropType,
  axisDisplayModeType,
} from '../../utils/proptypes';
import LineCollection from '../LineCollection';
import InteractionLayer from '../InteractionLayer';
import XAxis from '../XAxis';
import AxisDisplayMode from '../../utils/AxisDisplayMode';
import AxisPlacement from '../AxisPlacement';
import Layout from './Layout';
import { multiFormat } from '../../utils/multiFormat';
import Axes from '../../utils/Axes';
import { withDisplayName } from '../../utils/displayName';

const propTypes = {
  // Disable the ESLinter for this because they'll show up from react-sizeme.
  // They'll show up in time, and we set a defaultProp, then react-sizeme
  // doesn't work. So here we go!
  // eslint-disable-next-line react/require-default-props
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }),
  width: PropTypes.number,
  height: PropTypes.number,
  zoomable: PropTypes.bool,
  crosshair: PropTypes.bool,
  onMouseMove: PropTypes.func,
  onMouseOut: PropTypes.func,
  onBlur: PropTypes.func,
  onClick: PropTypes.func,
  // (annotation, x, y) => void
  onClickAnnotation: PropTypes.func,
  // event => void
  onDoubleClick: PropTypes.func,
  // ({ xSubDomain, transformation }) => void
  onZoomXAxis: PropTypes.func,
  xSubDomain: PropTypes.arrayOf(PropTypes.number),
  xAxisHeight: PropTypes.number,
  contextChart: GriffPropTypes.contextChart,
  yAxisTicks: PropTypes.number,
  ruler: rulerPropType,
  annotations: PropTypes.arrayOf(annotationPropType),
  // Number => String
  yAxisFormatter: PropTypes.func,
  xAxisPlacement: GriffPropTypes.axisPlacement,
  yAxisDisplayMode: axisDisplayModeType,
  // (e, seriesId) => void
  onAxisMouseEnter: PropTypes.func,
  // (e, seriesId) => void
  onAxisMouseLeave: PropTypes.func,
  areas: PropTypes.arrayOf(areaPropType),
  /**
   * Pass in a callback function which will be given a defined area when the
   * user creates one. See the definition in proptypes.js for a description of
   * what this object will look like.
   *
   * If this is set, then the chart will not have zooming functionality, because
   * the area definition mechanism (dragging a box with the mouse) conflicts
   * with the panning gesture. If both pieces of functionality are desired, then
   * this should only be set conditionally when the area definition
   * functionality should be enabled.
   */
  // area => null
  onAreaDefined: PropTypes.func,
  // (area, xpos, ypos) => shouldContinue
  onAreaClicked: PropTypes.func,
  pointWidth: PropTypes.number,
  // Number => String
  xAxisFormatter: PropTypes.func,

  yAxisWidth: PropTypes.number,

  // The following props are all supplied by internals (eg, React).
  children: PropTypes.arrayOf(PropTypes.node),
};

const defaultProps = {
  zoomable: true,
  contextChart: {
    visible: true,
    height: 100,
    isDefault: true,
  },
  crosshair: true,
  onMouseMove: null,
  onMouseOut: null,
  onBlur: null,
  onClick: null,
  onClickAnnotation: null,
  onDoubleClick: null,
  onZoomXAxis: null,
  // eslint-disable-next-line react/default-props-match-prop-types
  series: [],
  // eslint-disable-next-line react/default-props-match-prop-types
  collections: [],
  annotations: [],
  ruler: {
    visible: false,
    timeLabel: () => {},
    yLabel: () => {},
    timestamp: null,
  },
  xAxisHeight: 50,
  // eslint-disable-next-line react/default-props-match-prop-types
  yAxisWidth: 50,
  yAxisTicks: null,
  width: 0,
  height: 0,
  xSubDomain: [],
  xAxisFormatter: multiFormat,
  xAxisPlacement: AxisPlacement.BOTTOM,
  yAxisDisplayMode: AxisDisplayMode.ALL,
  yAxisFormatter: Number,
  // eslint-disable-next-line react/default-props-match-prop-types
  yAxisPlacement: AxisPlacement.RIGHT,
  onAxisMouseEnter: null,
  onAxisMouseLeave: null,
  areas: [],
  onAreaDefined: null,
  onAreaClicked: null,
  pointWidth: 6,
  children: [],
};

const getXAxisHeight = (xAxisHeight, xAxisPlacement) => {
  switch (xAxisPlacement) {
    case AxisPlacement.BOTH:
      return xAxisHeight * 2;
    case AxisPlacement.TOP:
    case AxisPlacement.BOTTOM:
    case AxisPlacement.UNSPECIFIED:
    default:
      return xAxisHeight;
  }
};

const getContextChartHeight = ({
  contextChart,
  xAxisHeight,
  xAxisPlacement,
}) => {
  if (!contextChart || contextChart.visible === false || !contextChart.height) {
    // No context chart to show.
    return 0;
  }

  return getXAxisHeight(xAxisHeight, xAxisPlacement) + contextChart.height;
};

const getYAxisCollectionWidth = (
  placement,
  { collections, series, yAxisDisplayMode, yAxisPlacement, yAxisWidth }
) => {
  const displayModeFilter = mode => item =>
    (item.yAxisDisplayMode || yAxisDisplayMode) === mode;

  const filteredItems = []
    .concat(series)
    .concat(collections)
    .filter(
      item =>
        !item.hidden &&
        item.collectionId === undefined &&
        ((item.yAxisPlacement || yAxisPlacement) &&
          ((item.yAxisPlacement || yAxisPlacement) === AxisPlacement.BOTH ||
            (item.yAxisPlacement || yAxisPlacement) === placement))
    );

  const hasCollapsed =
    filteredItems.filter(displayModeFilter(AxisDisplayMode.COLLAPSED)).length >
    0;

  const isDisplayModeALL = displayModeFilter(AxisDisplayMode.ALL);

  return filteredItems.reduce(
    (totalWidth, item) => {
      if (!isDisplayModeALL(item)) {
        return totalWidth;
      }
      // COLLAPSED items are already accounted-for with the initial value.
      if (item.yAxisDisplayMode === AxisDisplayMode.COLLAPSED) {
        return totalWidth;
      }
      return totalWidth + yAxisWidth;
    },
    hasCollapsed ? yAxisWidth : 0
  );
};

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

const LineChart = props => {
  const {
    annotations,
    areas,
    children,
    contextChart,
    crosshair,
    height: propHeight,
    onAreaDefined,
    onAreaClicked,
    onAxisMouseEnter,
    onAxisMouseLeave,
    onClick,
    onZoomXAxis,
    onClickAnnotation,
    onDoubleClick,
    onMouseMove,
    onMouseOut,
    onBlur,
    pointWidth,
    size,
    xSubDomain,
    ruler,
    width: propWidth,
    xAxisHeight,
    xAxisFormatter,
    xAxisPlacement,
    yAxisDisplayMode,
    yAxisFormatter,
    yAxisWidth,
    yAxisTicks,
    zoomable,
  } = props;

  if (!size) {
    // Can't proceed without a size; just abort until react-sizeme feeds it
    // to the component.
    return null;
  }

  const { width: sizeWidth, height: sizeHeight } = size;

  const width = propWidth || sizeWidth;
  const height = propHeight || sizeHeight;
  const contextChartSpace = getContextChartHeight(props);
  const chartWidth =
    width -
    getYAxisCollectionWidth(AxisPlacement.LEFT, props) -
    getYAxisCollectionWidth(AxisPlacement.RIGHT, props);
  const chartHeight = height - getXAxisHeight(xAxisHeight) - contextChartSpace;
  const chartSize = {
    width: Math.max(0, chartWidth),
    height: Math.max(0, chartHeight),
  };

  return (
    <Layout
      xAxisPlacement={xAxisPlacement}
      yAxisPlacement={getYAxisPlacement(props)}
      lineChart={
        <svg width={chartSize.width} height={chartSize.height}>
          {React.Children.map(children, child => {
            const childProps = {
              ...chartSize,
              axes: {
                ...(child.props || {}).axes,
                [Axes.x]:
                  ((child.props || {}).axes || {}).x === undefined
                    ? String(Axes.time)
                    : child.props.axes.x,
              },
            };
            return React.cloneElement(child, childProps);
          })}
          <LineCollection
            height={chartSize.height}
            width={chartSize.width}
            pointWidth={pointWidth}
          />
          {// sizeMe can cause chartSize.width to be < 0, which causes
          // problems for the position of the ruler in InteractionLayer
          chartSize.width > 0 && (
            <InteractionLayer
              height={chartSize.height}
              width={chartSize.width}
              crosshair={crosshair}
              onMouseMove={onMouseMove}
              onMouseOut={onMouseOut}
              onBlur={onBlur}
              onClickAnnotation={onClickAnnotation}
              onDoubleClick={onDoubleClick}
              ruler={ruler}
              annotations={annotations}
              onClick={onClick}
              areas={areas}
              onAreaDefined={onAreaDefined}
              onZoomXAxis={onZoomXAxis}
              onAreaClicked={onAreaClicked}
              zoomAxes={{ time: zoomable }}
            />
          )}
        </svg>
      }
      yAxis={
        <AxisCollection
          zoomable={zoomable}
          axisDisplayMode={yAxisDisplayMode}
          onMouseEnter={onAxisMouseEnter}
          onMouseLeave={onAxisMouseLeave}
          height={chartSize.height}
          tickFormatter={yAxisFormatter}
          yAxisWidth={yAxisWidth}
          ticks={yAxisTicks}
        />
      }
      xAxis={
        <XAxis
          domain={xSubDomain}
          height={xAxisHeight}
          placement={xAxisPlacement}
          tickFormatter={xAxisFormatter}
        />
      }
      contextChart={
        contextChart.visible && (
          <ContextChart
            height={contextChartSpace}
            zoomable={zoomable}
            annotations={annotations}
            xAxisFormatter={xAxisFormatter}
            xAxisHeight={xAxisHeight}
            xAxisPlacement={xAxisPlacement}
          />
        )
      }
    />
  );
};
LineChart.propTypes = propTypes;
LineChart.defaultProps = defaultProps;

const SizedLineChart = sizeMe({ monitorHeight: true })(LineChart);

export default withDisplayName('LineChart', props => (
  <ScalerContext.Consumer>
    {({ collections, series }) => (
      <SizedLineChart {...props} collections={collections} series={series} />
    )}
  </ScalerContext.Consumer>
));
