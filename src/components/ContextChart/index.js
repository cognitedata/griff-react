import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import isEqual from 'lodash.isequal';
import ScalerContext from '../../context/Scaler';
import LineCollection from '../LineCollection';
import XAxis from '../XAxis';
import Annotation from '../Annotation';
import { createXScale } from '../../utils/scale-helpers';
import { seriesPropType, annotationPropType } from '../../utils/proptypes';
import Brush from '../Brush';

// eslint-disable-next-line
export default class ContextChart extends Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    annotations: PropTypes.arrayOf(PropTypes.shape(annotationPropType)),
    height: PropTypes.number.isRequired,
    contextSeries: seriesPropType,
    baseDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    subDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    updateSubDomain: PropTypes.func.isRequired,
    zoomable: PropTypes.bool,
  };

  static defaultProps = {
    contextSeries: [],
    zoomable: true,
    annotations: [],
  };

  onUpdateSelection = selection => {
    const { baseDomain, width } = this.props;
    const xScale = createXScale(baseDomain, width);
    const subDomain = selection.map(xScale.invert).map(Number);
    this.props.updateSubDomain(subDomain);
  };

  render() {
    const { height, width, baseDomain, subDomain, contextSeries } = this.props;
    const xScale = createXScale(baseDomain, width);
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
          />
          <Brush
            width={width}
            height={height}
            selection={selection}
            onUpdateSelection={this.onUpdateSelection}
          />
        </svg>
        <XAxis width={width} height={50} domain={baseDomain} />
      </React.Fragment>
    );
  }
}

export const ScaledContextChart = props => (
  <ScalerContext.Consumer>
    {({ subDomain, baseDomain, updateSubDomain, contextSeries }) => (
      <ContextChart
        {...props}
        baseDomain={baseDomain}
        subDomain={subDomain}
        updateSubDomain={updateSubDomain}
        contextSeries={contextSeries}
      />
    )}
  </ScalerContext.Consumer>
);
