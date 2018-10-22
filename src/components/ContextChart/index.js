import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SizeMe } from 'react-sizeme';
import ScalerContext from '../../context/Scaler';
import { ScaledLineCollection as LineCollection } from '../LineCollection';
import XAxis from '../XAxis';
import Annotation from '../Annotation';
import GriffPropTypes, {
  seriesPropType,
  annotationPropType,
  scalerFactoryFunc,
} from '../../utils/proptypes';
import Brush from '../Brush';
import AxisPlacement from '../AxisPlacement';
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
    width: PropTypes.number,
    xDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    xScalerFactory: scalerFactoryFunc.isRequired,
    xSubDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    updateDomains: GriffPropTypes.updateDomains.isRequired,
    subDomainsByItemId: GriffPropTypes.subDomainsByItemId.isRequired,
    domainsByItemId: GriffPropTypes.domainsByItemId.isRequired,
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
    const {
      contextSeries: series,
      xDomain,
      width,
      xScalerFactory,
    } = this.props;
    const xScale = xScalerFactory(xDomain, width);
    const xSubDomain = selection.map(xScale.invert).map(Number);
    this.props.updateDomains(
      series.reduce(
        (changes, s) => ({
          ...changes,
          [s.id]: {
            x: xSubDomain,
          },
        }),
        {}
      )
    );
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
      contextSeries: series,
      domainsByItemId,
      subDomainsByItemId,
      width,
      contextSeries,
      xAxisFormatter,
      xAxisHeight,
      xAxisPlacement,
      xScalerFactory,
      zoomable,
    } = this.props;
    const firstItemId = series[0].id;
    const xDomain = domainsByItemId[firstItemId].x;
    const xSubDomain = subDomainsByItemId[firstItemId].x;
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
        scaled={false}
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
            scaleX={false}
            subDomainsByItemId={subDomainsByItemId}
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
  <ScalerContext.Consumer>
    {({
      domainsByItemId,
      subDomainsByItemId,
      xSubDomain,
      xDomain,
      contextSeries,
      xScalerFactory,
      updateDomains,
    }) => (
      <SizeMe monitorWidth>
        {({ size }) => (
          <ContextChart
            width={size.width}
            {...props}
            xDomain={xDomain}
            contextSeries={contextSeries}
            xSubDomain={xSubDomain}
            xScalerFactory={xScalerFactory}
            subDomainsByItemId={subDomainsByItemId}
            domainsByItemId={domainsByItemId}
            updateDomains={updateDomains}
          />
        )}
      </SizeMe>
    )}
  </ScalerContext.Consumer>
);
