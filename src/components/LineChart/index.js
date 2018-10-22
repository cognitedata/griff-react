import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import AxisCollection from '../AxisCollection';
import GridLines from '../GridLines';
import Scaler from '../Scaler';
import ScalerContext from '../../context/Scaler';
import ContextChart from '../ContextChart';
import GriffPropTypes, {
  areaPropType,
  seriesPropType,
  annotationPropType,
  rulerPropType,
  axisDisplayModeType,
  scalerFactoryFunc,
} from '../../utils/proptypes';
import { ScaledLineCollection } from '../LineCollection';
import InteractionLayer from '../InteractionLayer';
import XAxis from '../XAxis';
import AxisDisplayMode from './AxisDisplayMode';
import AxisPlacement from '../AxisPlacement';
import Layout from './Layout';
import { createXScale } from '../../utils/scale-helpers';
import multiFormat from '../../utils/multiFormat';

const propTypes = {
  // Disable the ESLinter for this because they'll show up from react-sizeme.
  // They'll show up in time, and we set a defaultProp, then react-sizeme
  // doesn't work. So here we go!
  // eslint-disable-next-line react/require-default-props
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }),
  grid: GriffPropTypes.grid,
  width: PropTypes.number,
  height: PropTypes.number,
  zoomable: PropTypes.bool,
  series: seriesPropType,
  collections: GriffPropTypes.collections,
  crosshair: PropTypes.bool,
  onMouseMove: PropTypes.func,
  onClick: PropTypes.func,
  // (annotation, x, y) => void
  onClickAnnotation: PropTypes.func,
  // event => void
  onDoubleClick: PropTypes.func,
  // ({ xSubDomain, transformation }) => void
  onZoomXAxis: PropTypes.func,
  xSubDomain: PropTypes.arrayOf(PropTypes.number),
  xAxisHeight: PropTypes.number,
  yAxisWidth: PropTypes.number,
  contextChart: GriffPropTypes.contextChart,
  ruler: rulerPropType,
  annotations: PropTypes.arrayOf(annotationPropType),
  // Number => String
  yAxisFormatter: PropTypes.func,
  xAxisPlacement: GriffPropTypes.axisPlacement,
  yAxisDisplayMode: axisDisplayModeType,
  yAxisPlacement: GriffPropTypes.axisPlacement,
  // (e, seriesId) => void
  onAxisMouseEnter: PropTypes.func,
  // (e, seriesId) => void
  onAxisMouseLeave: PropTypes.func,
  xScalerFactory: scalerFactoryFunc,
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
};

const defaultProps = {
  grid: null,
  zoomable: true,
  contextChart: {
    visible: true,
    height: 100,
    isDefault: true,
  },
  crosshair: true,
  onMouseMove: null,
  onClick: null,
  onClickAnnotation: null,
  onDoubleClick: null,
  onZoomXAxis: null,
  series: [],
  collections: [],
  annotations: [],
  ruler: {
    visible: false,
    xLabel: () => {},
    yLabel: () => {},
  },
  xAxisHeight: 50,
  yAxisWidth: 50,
  width: 0,
  height: 0,
  xSubDomain: [],
  xAxisFormatter: multiFormat,
  xAxisPlacement: AxisPlacement.BOTTOM,
  xScalerFactory: createXScale,
  yAxisDisplayMode: AxisDisplayMode.ALL,
  yAxisFormatter: Number,
  yAxisPlacement: AxisPlacement.RIGHT,
  onAxisMouseEnter: null,
  onAxisMouseLeave: null,
  areas: [],
  onAreaDefined: null,
  onAreaClicked: null,
  pointWidth: 6,
};

class LineChartComponent extends Component {
  state = {};

  getContextChartHeight = () => {
    const { contextChart, xAxisHeight } = this.props;
    if (
      !contextChart ||
      contextChart.visible === false ||
      !contextChart.height
    ) {
      // No context chart to show.
      return 0;
    }

    return this.getXAxisHeight(xAxisHeight) + contextChart.height;
  };

  getXAxisHeight = height => {
    const { xAxisPlacement } = this.props;
    switch (xAxisPlacement) {
      case AxisPlacement.BOTH:
        return height * 2;
      case AxisPlacement.TOP:
      case AxisPlacement.BOTTOM:
      case AxisPlacement.UNSPECIFIED:
      default:
        return height;
    }
  };

  getYAxisCollectionWidth = placement => {
    const {
      collections,
      series,
      yAxisDisplayMode,
      yAxisPlacement,
      yAxisWidth,
    } = this.props;

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
      filteredItems.filter(displayModeFilter(AxisDisplayMode.COLLAPSED))
        .length > 0;

    const isDisplayModeALL = displayModeFilter(AxisDisplayMode.ALL);

    return filteredItems.reduce((totalWidth, item) => {
      if (!isDisplayModeALL(item)) {
        return totalWidth;
      }
      // COLLAPSED items are already accounted-for with the initial value.
      if (item.yAxisDisplayMode === AxisDisplayMode.COLLAPSED) {
        return totalWidth;
      }
      return totalWidth + yAxisWidth;
    }, hasCollapsed ? yAxisWidth : 0);
  };

  getYAxisPlacement = () => {
    const { collections, series, yAxisPlacement } = this.props;
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

  render() {
    const {
      annotations,
      areas,
      contextChart,
      crosshair,
      grid,
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
      pointWidth,
      size,
      xSubDomain,
      ruler,
      width: propWidth,
      xScalerFactory,
      xAxisHeight,
      xAxisFormatter,
      xAxisPlacement,
      yAxisDisplayMode,
      yAxisFormatter,
      zoomable,
    } = this.props;

    if (!size) {
      // Can't proceed without a size; just abort until react-sizeme feeds it
      // to the component.
      return null;
    }

    const { width: sizeWidth, height: sizeHeight } = size;

    const width = propWidth || sizeWidth;
    const height = propHeight || sizeHeight;
    const contextChartSpace = this.getContextChartHeight();
    const chartSize = {
      width:
        width -
        this.getYAxisCollectionWidth(AxisPlacement.LEFT) -
        this.getYAxisCollectionWidth(AxisPlacement.RIGHT),
      height: height - this.getXAxisHeight(xAxisHeight) - contextChartSpace,
    };

    return (
      <Layout
        xAxisPlacement={xAxisPlacement}
        yAxisPlacement={this.getYAxisPlacement()}
        lineChart={
          <svg width={chartSize.width} height={chartSize.height}>
            <GridLines
              grid={grid}
              height={chartSize.height}
              width={chartSize.width}
            />
            <ScaledLineCollection
              height={chartSize.height}
              width={chartSize.width}
              pointWidth={pointWidth}
            />
            <InteractionLayer
              height={chartSize.height}
              width={chartSize.width}
              crosshair={crosshair}
              onMouseMove={onMouseMove}
              onClickAnnotation={onClickAnnotation}
              onDoubleClick={onDoubleClick}
              zoomable={zoomable}
              ruler={ruler}
              annotations={annotations}
              onClick={onClick}
              areas={areas}
              onAreaDefined={onAreaDefined}
              onZoomXAxis={onZoomXAxis}
              onAreaClicked={onAreaClicked}
              zoomAxes={{ time: true }}
            />
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
          />
        }
        xAxis={
          <XAxis
            domain={xSubDomain}
            xScalerFactory={xScalerFactory}
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
  }
}
LineChartComponent.propTypes = propTypes;
LineChartComponent.defaultProps = defaultProps;

const SizedLineChartComponent = sizeMe({ monitorHeight: true })(
  LineChartComponent
);

const LineChart = props => (
  <ScalerContext.Consumer>
    {({ collections, series, xSubDomain, xScalerFactory, yAxisWidth }) => (
      <SizedLineChartComponent
        {...props}
        collections={collections}
        series={series}
        timeSubDomain={xSubDomain}
        xScalerFactory={xScalerFactory}
        yAxisWidth={yAxisWidth}
      />
    )}
  </ScalerContext.Consumer>
);

LineChart.propTypes = propTypes;
LineChart.defaultProps = defaultProps;

export default LineChart;
