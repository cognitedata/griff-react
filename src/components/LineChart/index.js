import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import styled from 'styled-components';
import AxisCollection from '../AxisCollection';
import XAxis from '../XAxis';
import { ScaledLineCollection } from '../LineCollection';
import InteractionLayer from '../InteractionLayer';
import Scaler from '../Scaler';
import ScalerContext from '../../context/Scaler';
import { ScaledContextChart } from '../ContextChart';
import { seriesPropType, annotationPropType } from '../../utils/proptypes';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;

  .handle {
    width: 6px;
    fill: rgb(0, 72, 125);
  }
`;

const CONTEXTCHART_HEIGHT_PCT = 0.1;

class LineChartComponent extends Component {
  static propTypes = {
    zoomable: PropTypes.bool,
    size: PropTypes.shape({
      width: PropTypes.number.isRequired,
    }).isRequired,
    height: PropTypes.number.isRequired,
    series: seriesPropType,
    crosshair: PropTypes.bool,
    onMouseMove: PropTypes.func,
    subDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    yAxisWidth: PropTypes.number.isRequired,
    contextChart: PropTypes.shape({
      visible: PropTypes.bool.isRequired,
    }),
    annotations: PropTypes.arrayOf(PropTypes.shape(annotationPropType)),
    ruler: PropTypes.objectOf(PropTypes.func).isRequired,
  };

  static defaultProps = {
    zoomable: true,
    contextChart: {
      visible: true,
    },
    crosshair: true,
    onMouseMove: null,
    series: [],
    annotations: [],
  };

  state = {};

  render() {
    const {
      size: { width },
      height,
      series,
      yAxisWidth,
      subDomain,
      crosshair,
      onMouseMove,
      zoomable,
      contextChart,
      annotations,
      ruler,
      contextChart: { visible },
    } = this.props;
    const visibleSeries = series.filter(s => !s.hidden);
    const axisCollectionWidth = yAxisWidth * visibleSeries.length;
    const contextHeight = contextChart.visible
      ? CONTEXTCHART_HEIGHT_PCT * height
      : 0;
    const lineCollectionHeight = height - contextHeight;
    const lineCollectionWidth = width - axisCollectionWidth;
    return (
      <Wrapper>
        <div className="lines-container">
          <svg width={lineCollectionWidth} height={lineCollectionHeight}>
            <ScaledLineCollection
              height={lineCollectionHeight}
              width={lineCollectionWidth}
            />
            <InteractionLayer
              height={lineCollectionHeight}
              width={lineCollectionWidth}
              crosshair={crosshair}
              onMouseMove={onMouseMove}
              zoomable={zoomable}
              ruler={ruler}
              annotations={annotations}
            />
          </svg>
        </div>
        <div className="y-axis-container">
          <AxisCollection
            height={lineCollectionHeight}
            width={axisCollectionWidth}
            zoomable={zoomable}
          />
        </div>
        <div className="x-axis-container">
          <XAxis width={lineCollectionWidth} domain={subDomain} />
        </div>
        <div />
        {visible && (
          <div className="context-container">
            <ScaledContextChart
              height={contextHeight}
              width={lineCollectionWidth}
              zoomable={zoomable}
              annotations={annotations}
            />
          </div>
        )}
      </Wrapper>
    );
  }
}

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

export default LineChart;
