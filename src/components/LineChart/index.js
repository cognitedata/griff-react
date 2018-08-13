import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import AxisCollection from '../AxisCollection';
import GridLines from '../GridLines';
import Scaler from '../Scaler';
import ScalerContext from '../../context/Scaler';
import { ScaledContextChart } from '../ContextChart';
import GriffPropTypes, {
  areaPropType,
  contextChartPropType,
  seriesPropType,
  annotationPropType,
  rulerPropType,
  axisDisplayModeType,
} from '../../utils/proptypes';
import { ScaledLineCollection } from '../LineCollection';
import InteractionLayer from '../InteractionLayer';
import XAxis from '../XAxis';
import AxisDisplayMode from './AxisDisplayMode';

const propTypes = {
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
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
  subDomain: PropTypes.arrayOf(PropTypes.number),
  yAxisWidth: PropTypes.number,
  contextChart: contextChartPropType,
  ruler: rulerPropType,
  annotations: PropTypes.arrayOf(annotationPropType),
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
};

const defaultProps = {
  grid: null,
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
  collections: [],
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

  getYAxisCollectionWidth = () => {
    const { collections, series, yAxisDisplayMode, yAxisWidth } = this.props;
    const counts = {};
    const addCount = item => {
      if (item.hidden) {
        return;
      }
      if (item.collectionId) {
        return;
      }
      const mode = (item.yAxisDisplayMode || yAxisDisplayMode).id;
      counts[mode] = (counts[mode] || 0) + 1;
    };
    series.forEach(addCount);
    collections.forEach(addCount);
    const w1 = AxisDisplayMode.ALL.width(
      yAxisWidth,
      counts[AxisDisplayMode.ALL.id] || 0
    );
    const w2 = AxisDisplayMode.COLLAPSED.width(
      yAxisWidth,
      counts[AxisDisplayMode.COLLAPSED.id] || 0
    );
    const width = w1 + w2;
    return width;
  };

  render() {
    const {
      grid,
      size: { width: sizeWidth, height: sizeHeight },
      width: propWidth,
      height: propHeight,
      subDomain,
      crosshair,
      onMouseMove,
      onClick,
      onClickAnnotation,
      onDoubleClick,
      zoomable,
      yAxisDisplayMode,
      onAxisMouseEnter,
      onAxisMouseLeave,
      contextChart,
      annotations,
      ruler,
      areas,
      onAreaDefined,
      onAreaClicked,
    } = this.props;

    const width = propWidth || sizeWidth;
    const height = propHeight || sizeHeight;
    const xAxisHeight = 50;
    const axisCollectionSize = {
      width: this.getYAxisCollectionWidth(),
    };
    const contextChartSpace = this.getContextChartHeight({
      xAxisHeight,
      height,
    });
    const chartSize = {
      width: width - axisCollectionSize.width,
      height: height - xAxisHeight - contextChartSpace,
    };

    axisCollectionSize.height = chartSize.height;

    return (
      <div
        className="linechart-container"
        style={{
          display: 'grid',
          gridTemplateColumns: `1fr auto`,
          gridTemplateRows: '1fr auto',
          height: '100%',
        }}
      >
        <div className="lines-container" style={{ height: '100%' }}>
          <svg width={chartSize.width} height={chartSize.height}>
            <GridLines
              grid={grid}
              height={chartSize.height}
              width={chartSize.width}
            />
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
        </div>
        <div
          className="y-axis-container"
          style={{
            width: `${axisCollectionSize.width}px`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AxisCollection
            zoomable={zoomable}
            axisDisplayMode={yAxisDisplayMode}
            onMouseEnter={onAxisMouseEnter}
            onMouseLeave={onAxisMouseLeave}
            height={axisCollectionSize.height}
            width={axisCollectionSize.width}
          />
        </div>
        <div className="x-axis-container" style={{ width: '100%' }}>
          <XAxis domain={subDomain} width={chartSize.width} />
        </div>
        <div />
        {contextChart.visible && (
          <div
            className="context-container"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <ScaledContextChart
              height={contextChart.height || 100}
              width={chartSize.width}
              zoomable={zoomable}
              annotations={annotations}
            />
          </div>
        )}
      </div>
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
      {({ collections, series, subDomain, yAxisWidth }) => (
        <SizedLineChartComponent
          {...props}
          collections={collections}
          series={series}
          subDomain={subDomain}
          yAxisWidth={yAxisWidth}
        />
      )}
    </ScalerContext.Consumer>
  </Scaler>
);

LineChart.propTypes = propTypes;
LineChart.defaultProps = defaultProps;

export default LineChart;
