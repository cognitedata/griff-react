import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import AxisCollection from '../AxisCollection';
import Scaler from '../Scaler';
import ScalerContext from '../../context/Scaler';
import { ScaledContextChart } from '../ContextChart';
import {
  contextChartPropType,
  seriesPropType,
  annotationPropType,
  rulerPropType,
} from '../../utils/proptypes';
import { ScaledLineCollection } from '../LineCollection';
import InteractionLayer from '../InteractionLayer';
import XAxis from '../XAxis';

const propTypes = {
  // eslint-disable-next-line react/require-default-props
  size: PropTypes.shape({ width: PropTypes.number.isRequired }),
  width: PropTypes.number,
  height: PropTypes.number.isRequired,
  zoomable: PropTypes.bool,
  series: seriesPropType,
  crosshair: PropTypes.bool,
  onMouseMove: PropTypes.func,
  subDomain: PropTypes.arrayOf(PropTypes.number),
  yAxisWidth: PropTypes.number,
  contextChart: contextChartPropType,
  annotations: PropTypes.arrayOf(PropTypes.shape(annotationPropType)),
  ruler: rulerPropType,
};

const defaultProps = {
  zoomable: true,
  contextChart: {
    visible: true,
    height: 100,
  },
  crosshair: true,
  onMouseMove: null,
  series: [],
  annotations: [],
  ruler: {
    visible: false,
    xLabel: () => {},
    yLabel: () => {},
  },
  yAxisWidth: 50,
  width: 0,
  subDomain: [],
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

  render() {
    const {
      size: { width: sizeWidth },
      width: propWidth,
      height,
      series,
      yAxisWidth,
      subDomain,
      crosshair,
      onMouseMove,
      zoomable,
      annotations,
      ruler,
      contextChart,
    } = this.props;
    const visibleSeries = series.filter(s => !s.hidden);

    const width = propWidth || sizeWidth;
    const xAxisHeight = 50;
    const axisCollectionSize = {
      width: yAxisWidth * visibleSeries.length,
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
        style={{
          display: 'grid',
          gridTemplateColumns: `${chartSize.width}px auto`,
          gridTemplateRows: '1fr auto',
          height: `${height}px`,
        }}
      >
        <div className="lines-container" style={{ height: '100%' }}>
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
              zoomable={zoomable}
              ruler={ruler}
              annotations={annotations}
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
            width={axisCollectionSize.width}
            height={axisCollectionSize.height}
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

const SizedLineChartComponent = sizeMe()(LineChartComponent);

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
