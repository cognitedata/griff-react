import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ScalerContext from '../../context/Scaler';
import LineCollection from '../LineCollection';
import XAxis from '../XAxis';
import Annotation from '../Annotation';
import GriffPropTypes, {
  seriesPropType,
  annotationPropType,
  scalerFactoryFunc,
} from '../../utils/proptypes';
import Brush from '../Brush';
import AxisPlacement from '../AxisPlacement';

export default class ContextChart extends Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    annotations: PropTypes.arrayOf(annotationPropType),
    height: PropTypes.number.isRequired,
    contextSeries: seriesPropType,
    xDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    xSubDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    updateXSubDomain: PropTypes.func.isRequired,
    zoomable: PropTypes.bool,
    xScalerFactory: scalerFactoryFunc.isRequired,
    // Number => String
    xAxisFormatter: PropTypes.func,
    xAxisHeight: PropTypes.number,
    xAxisPlacement: GriffPropTypes.axisPlacement,
  };

  static defaultProps = {
    annotations: [],
    contextSeries: [],
    zoomable: true,
    xAxisFormatter: null,
    xAxisHeight: 50,
    xAxisPlacement: AxisPlacement.BOTTOM,
  };

  onUpdateSelection = selection => {
    const { xDomain, width, xScalerFactory } = this.props;
    const xScale = xScalerFactory(xDomain, width);
    const xSubDomain = selection.map(xScale.invert).map(Number);
    this.props.updateXSubDomain(xSubDomain);
  };

  getChartHeight = () => {
    const { height, xAxisHeight, xAxisPlacement } = this.props;

    return (
      height -
      xAxisHeight -
      (xAxisPlacement === AxisPlacement.BOTH ? xAxisHeight : 0)
    );
  };

  renderXAxis = (position, xAxis) => {
    const { xAxisPlacement } = this.props;
    if (position === xAxisPlacement) {
      return xAxis;
    }
    if (xAxisPlacement === AxisPlacement.BOTH) {
      return React.cloneElement(xAxis, { xAxisPlacement: position });
    }
    return null;
  };

  render() {
    const {
      width,
      xDomain,
      xSubDomain,
      contextSeries,
      xAxisFormatter,
      xAxisHeight,
      xAxisPlacement,
      xScalerFactory,
      zoomable,
    } = this.props;
    const height = this.getChartHeight();
    const xScale = xScalerFactory(xDomain, width);
    const selection = xSubDomain.map(xScale);
    const annotations = this.props.annotations.map(a => (
      <Annotation key={a.id} {...a} height={height} xScale={xScale} />
    ));

    const xAxis = (
      <XAxis
        width={width}
        height={xAxisHeight}
        domain={xDomain}
        tickFormatter={xAxisFormatter}
        xAxisPlacement={xAxisPlacement}
        xScalerFactory={xScalerFactory}
      />
    );

    return (
      <React.Fragment>
        {this.renderXAxis(AxisPlacement.TOP, xAxis)}
        <svg height={height} width={width}>
          {annotations}
          <LineCollection
            series={contextSeries}
            width={width}
            height={height}
            domain={xDomain}
            xScalerFactory={xScalerFactory}
            scaleY={false}
          />
          <Brush
            width={width}
            height={height}
            selection={selection}
            onUpdateSelection={this.onUpdateSelection}
            zoomable={zoomable}
          />
        </svg>
        {this.renderXAxis(AxisPlacement.BOTTOM, xAxis)}
      </React.Fragment>
    );
  }
}

export const ScaledContextChart = props => (
  <ScalerContext.Consumer>
    {({
      xSubDomain,
      xDomain,
      updateXSubDomain,
      contextSeries,
      xScalerFactory,
    }) => (
      <ContextChart
        {...props}
        xDomain={xDomain}
        contextSeries={contextSeries}
        xSubDomain={xSubDomain}
        updateXSubDomain={updateXSubDomain}
        xScalerFactory={xScalerFactory}
      />
    )}
  </ScalerContext.Consumer>
);
