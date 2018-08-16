import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ScalerContext from '../../context/Scaler';
import LineCollection from '../LineCollection';
import XAxis from '../XAxis';
import Annotation from '../Annotation';
import {
  seriesPropType,
  annotationPropType,
  scalerFactoryFunc,
} from '../../utils/proptypes';
import Brush from '../Brush';

export default class ContextChart extends Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    annotations: PropTypes.arrayOf(annotationPropType),
    height: PropTypes.number.isRequired,
    contextSeries: seriesPropType,
    baseDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    subDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    updateSubDomain: PropTypes.func.isRequired,
    zoomable: PropTypes.bool,
    xScalerFactory: scalerFactoryFunc.isRequired,
  };

  static defaultProps = {
    annotations: [],
    contextSeries: [],
    zoomable: true,
  };

  onUpdateSelection = selection => {
    const { baseDomain, width, xScalerFactory } = this.props;
    const xScale = xScalerFactory(baseDomain, width);
    const subDomain = selection.map(xScale.invert).map(Number);
    this.props.updateSubDomain(subDomain);
  };

  render() {
    const {
      height,
      width,
      baseDomain,
      subDomain,
      contextSeries,
      xScalerFactory,
      zoomable,
    } = this.props;
    const xScale = xScalerFactory(baseDomain, width);
    const selection = subDomain.map(xScale);
    const annotations = this.props.annotations.map(a => (
      <Annotation key={a.id} {...a} height={height} xScale={xScale} />
    ));

    return (
      <React.Fragment>
        <svg height={height} width={width}>
          {annotations}
          <LineCollection
            series={contextSeries}
            width={width}
            height={height}
            domain={baseDomain}
            xScalerFactory={xScalerFactory}
          />
          <Brush
            width={width}
            height={height}
            selection={selection}
            onUpdateSelection={this.onUpdateSelection}
            zoomable={zoomable}
          />
        </svg>
        <XAxis
          width={width}
          height={50}
          domain={baseDomain}
          xScalerFactory={xScalerFactory}
        />
      </React.Fragment>
    );
  }
}

export const ScaledContextChart = props => (
  <ScalerContext.Consumer>
    {({
      subDomain,
      baseDomain,
      updateSubDomain,
      contextSeries,
      xScalerFactory,
    }) => (
      <ContextChart
        {...props}
        baseDomain={baseDomain}
        contextSeries={contextSeries}
        subDomain={subDomain}
        updateSubDomain={updateSubDomain}
        xScalerFactory={xScalerFactory}
      />
    )}
  </ScalerContext.Consumer>
);
