import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SizeMe } from 'react-sizeme';
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
import Scaler from '../Scaler';
import { createLinearXScale } from '../../utils/scale-helpers';
import multiFormat from '../../utils/multiFormat';

class ContextChart extends Component {
  static propTypes = {
    height: PropTypes.number,
    annotations: PropTypes.arrayOf(annotationPropType),
    zoomable: PropTypes.bool,
    // Number => String
    xAxisFormatter: PropTypes.func,
    xAxisHeight: PropTypes.number,
    xAxisPlacement: GriffPropTypes.axisPlacement,

    // These are all provided by Griff.
    contextSeries: seriesPropType,
    updateXSubDomain: PropTypes.func.isRequired,
    width: PropTypes.number,
    xDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    xScalerFactory: scalerFactoryFunc.isRequired,
    xSubDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
  };

  static defaultProps = {
    width: 1,
    height: 150,
    annotations: [],
    contextSeries: [],
    zoomable: true,
    xAxisFormatter: multiFormat,
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
        height={xAxisHeight}
        domain={xDomain}
        tickFormatter={xAxisFormatter}
        placement={xAxisPlacement}
      />
    );

    return (
      <React.Fragment>
        {this.renderXAxis(AxisPlacement.TOP, xAxis)}
        <svg
          height={height}
          width={width}
          style={{ width: '100%', display: 'block' }}
        >
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

export default props => (
  <Scaler xScalerFactory={createLinearXScale}>
    <ScalerContext.Consumer>
      {({
        xSubDomain,
        xDomain,
        updateXSubDomain,
        contextSeries,
        xScalerFactory,
      }) => (
        <SizeMe monitorWidth>
          {({ size }) => (
            <ContextChart
              width={size.width}
              {...props}
              xDomain={xDomain}
              contextSeries={contextSeries}
              xSubDomain={xSubDomain}
              updateXSubDomain={updateXSubDomain}
              xScalerFactory={xScalerFactory}
            />
          )}
        </SizeMe>
      )}
    </ScalerContext.Consumer>
  </Scaler>
);
