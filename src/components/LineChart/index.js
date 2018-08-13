import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import AxisCollection from '../AxisCollection';
import Scaler from '../Scaler';
import ScalerContext from '../../context/Scaler';
import { ScaledContextChart } from '../ContextChart';
import {
  areaPropType,
  contextChartPropType,
  seriesPropType,
  annotationPropType,
  rulerPropType,
  axisDisplayModeType,
  axisPlacementType,
} from '../../utils/proptypes';
import { ScaledLineCollection } from '../LineCollection';
import InteractionLayer from '../InteractionLayer';
import XAxis from '../XAxis';
import AxisDisplayMode from './AxisDisplayMode';
import AxisPlacement from './AxisPlacement';
import Layout from './Layout';

const propTypes = {
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  zoomable: PropTypes.bool,
  series: seriesPropType,
  crosshair: PropTypes.bool,
  onMouseMove: PropTypes.func,
  onClick: PropTypes.func,
  // (annotation, x, y) => void
  onClickAnnotation: PropTypes.func,
  // event => void
  onDoubleClick: PropTypes.func,
  subDomain: PropTypes.arrayOf(PropTypes.number),
  yAxisWidth: PropTypes.number,
  contextChart: contextChartPropType,
  ruler: rulerPropType,
  annotations: PropTypes.arrayOf(annotationPropType),
  yAxisDisplayMode: axisDisplayModeType,
  yAxisPlacement: axisPlacementType,
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
};

const defaultProps = {
  zoomable: true,
  contextChart: {
    visible: true,
    height: 100,
  },
  crosshair: true,
  onMouseMove: null,
  onClick: null,
  onClickAnnotation: null,
  onDoubleClick: null,
  series: [],
  annotations: [],
  ruler: {
    visible: false,
    xLabel: () => {},
    yLabel: () => {},
  },
  yAxisWidth: 50,
  width: 0,
  height: 0,
  subDomain: [],
  yAxisDisplayMode: AxisDisplayMode.ALL,
  yAxisPlacement: AxisPlacement.RIGHT,
  onAxisMouseEnter: null,
  onAxisMouseLeave: null,
  areas: [],
  onAreaDefined: null,
  onAreaClicked: null,
};

class LineChartComponent extends Component {
  state = {};

  getContextChartHeight = ({ xAxisHeight, height }) => {
    const { contextChart } = this.props;
    if (!contextChart || contextChart.visible === false) {
      // No context chart to show.
      return 0;
    }

    if (contextChart.heightPct) {
      return xAxisHeight + contextChart.heightPct * (height - xAxisHeight);
    }

    return xAxisHeight + (contextChart.height || 100);
  };

  getYAxisCollectionWidth = placement => {
    const { series, yAxisDisplayMode, yAxisPlacement, yAxisWidth } = this.props;

    const filteredSeries = series
      .filter(s => !s.hidden)
      .filter(
        s =>
          (s.yAxisPlacement || yAxisPlacement) &&
          ((s.yAxisPlacement || yAxisPlacement) === AxisPlacement.BOTH ||
            (s.yAxisPlacement || yAxisPlacement) === placement)
      );

    const displayModeFilter = mode => s =>
      (s.yAxisDisplayMode || yAxisDisplayMode) === mode;

    return filteredSeries
      .filter(displayModeFilter(AxisDisplayMode.ALL))
      .reduce((acc, s) => {
        if (s.yAxisDisplayMode === AxisDisplayMode.COLLAPSED) {
          return acc;
        }
        return acc + yAxisWidth;
      }, filteredSeries.filter(displayModeFilter(AxisDisplayMode.COLLAPSED)).length ? yAxisWidth : 0);
  };

  getYAxisPlacement = () => {
    const { series, yAxisPlacement } = this.props;
    const yAxisPlacements = series.reduce(
      (acc, s) => {
        if (s.yAxisPlacement) {
          acc[s.yAxisPlacement] = (acc[s.yAxisPlacement] || 0) + 1;
        }
        return acc;
      },
      { [yAxisPlacement]: 1 }
    );
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
      height: propHeight,
      onAreaDefined,
      onAreaClicked,
      onAxisMouseEnter,
      onAxisMouseLeave,
      onClick,
      onClickAnnotation,
      onDoubleClick,
      onMouseMove,
      size: { width: sizeWidth, height: sizeHeight },
      subDomain,
      ruler,
      width: propWidth,
      yAxisDisplayMode,
      zoomable,
    } = this.props;

    const width = propWidth || sizeWidth;
    const height = propHeight || sizeHeight;
    const xAxisHeight = 50;
    const contextChartSpace = this.getContextChartHeight({
      xAxisHeight,
      height,
    });
    const chartSize = {
      width:
        width -
        this.getYAxisCollectionWidth(AxisPlacement.LEFT) -
        this.getYAxisCollectionWidth(AxisPlacement.RIGHT),
      height: height - xAxisHeight - contextChartSpace,
    };

    return (
      <Layout
        yAxisPlacement={this.getYAxisPlacement()}
        lineChart={
          <svg width={chartSize.width} height={chartSize.height}>
            <ScaledLineCollection
              height={chartSize.height}
              width={chartSize.width}
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
              onAreaClicked={onAreaClicked}
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
          />
        }
        xAxis={<XAxis domain={subDomain} width={chartSize.width} />}
        contextChart={
          contextChart.visible && (
            <ScaledContextChart
              height={contextChart.height || 100}
              width={chartSize.width}
              zoomable={zoomable}
              annotations={annotations}
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
  <Scaler>
    <ScalerContext.Consumer>
      {({ yAxisWidth, series, subDomain }) => (
        <SizedLineChartComponent
          {...props}
          yAxisWidth={yAxisWidth}
          series={series}
          subDomain={subDomain}
        />
      )}
    </ScalerContext.Consumer>
  </Scaler>
);

LineChart.propTypes = propTypes;
LineChart.defaultProps = defaultProps;

export default LineChart;
