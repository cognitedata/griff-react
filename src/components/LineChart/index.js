import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AxisCollection from '../AxisCollection';
import Scaler from '../Scaler';
import ScalerContext from '../../context/Scaler';
import { ScaledContextChart } from '../ContextChart';
import {
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
  // eslint-disable-next-line react/require-default-props }),
  width: PropTypes.number,
  height: PropTypes.number.isRequired,
  zoomable: PropTypes.bool,
  series: seriesPropType,
  crosshair: PropTypes.bool,
  onMouseMove: PropTypes.func,
  onClick: PropTypes.func,
  // (annotation, x, y) => null
  onClickAnnotation: PropTypes.func,
  subDomain: PropTypes.arrayOf(PropTypes.number),
  yAxisWidth: PropTypes.number,
  contextChart: contextChartPropType,
  ruler: rulerPropType,
  annotations: PropTypes.arrayOf(annotationPropType),
  yAxisDisplayMode: axisDisplayModeType,
  onAxisMouseEnter: PropTypes.func,
  onAxisMouseLeave: PropTypes.func,
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
  yAxisDisplayMode: AxisDisplayMode.ALL,
  onAxisMouseEnter: null,
  onAxisMouseLeave: null,
};

class LineChartComponent extends Component {
  state = {};

  componentWillMount = () => {
    this.updateDimensions();
  };


  componentDidMount = () => {
    window.addEventListener('resize', this.updateDimensions);
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.updateDimensions);
  };

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
    const { yAxisDisplayMode, series, yAxisWidth } = this.props;
    const counts = {};
    series.forEach(s => {
      if (s.hidden) {
        return;
      }
      const mode = (s.yAxisDisplayMode || yAxisDisplayMode).id;
      counts[mode] = (counts[mode] || 0) + 1;
    });
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

  updateDimensions = () => {
    this.setState({
      width:
        document.getElementById('chart-container') &&
        document.getElementById('chart-container').clientWidth,
    });
  };

  render() {
    const {
      width: propWidth,
      height,
      subDomain,
      crosshair,
      onMouseMove,
      onClick,
      onClickAnnotation,
      zoomable,
      yAxisDisplayMode,
      onAxisMouseEnter,
      onAxisMouseLeave,
      contextChart,
      annotations,
      ruler,
    } = this.props;

    const { refWidth = 0, refHeight = 0 } = this.state;

    const renderedWidth = this.state.width || (document.getElementById('chart-container') && document.getElementById('chart-container').clientWidth); //get rendered width on initial render otherwise use state value

    const width = propWidth || renderedWidth;
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
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gridTemplateRows: '1fr auto',
          height: '100%',
        }}
        id="chart-container"
      >
        <div
          className="lines-container"
          style={{
            height: '100%',
          }}
          ref={r => {
            if (r) {
              if (
                this.state.refWidth !== r.clientWidth ||
                this.state.refHeight !== r.clientHeight
              ) {
                this.setState({
                  refWidth: r.clientWidth,
                  refHeight: r.clientHeight,
                });
              }
            }
          }}
        >
          <svg width="100%" height="100%" style={{ display: 'block' }}>
            <ScaledLineCollection width={refWidth} height={refHeight} />
            <InteractionLayer
              width={refWidth}
              height={refHeight}
              crosshair={crosshair}
              onMouseMove={onMouseMove}
              onClickAnnotation={onClickAnnotation}
              zoomable={zoomable}
              ruler={ruler}
              annotations={annotations}
              onClick={onClick}
            />
          </svg>
        </div>
        <div
          className="y-axis-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AxisCollection
            zoomable={zoomable}
            axisDisplayMode={yAxisDisplayMode}
            onMouseEnter={onAxisMouseEnter}
            onMouseLeave={onAxisMouseLeave}
            height={refHeight}
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

LineChartComponent.propTypes = propTypes;
LineChartComponent.defaultProps = defaultProps;

const LineChart = props => (
  <Scaler>
    <ScalerContext.Consumer>
      {({ yAxisWidth, series, subDomain }) => (
        <LineChartComponent
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
