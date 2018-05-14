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

export default class ContextChart extends Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    annotations: PropTypes.arrayOf(PropTypes.shape(annotationPropType)),
    height: PropTypes.number.isRequired,
    contextSeries: seriesPropType,
    baseDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    subDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    updateXTransformation: PropTypes.func.isRequired,
    zoomable: PropTypes.bool,
  };

  static defaultProps = {
    contextSeries: [],
    zoomable: true,
    annotations: [],
  };

  componentDidMount() {
    const { width, height } = this.props;
    this.brush = d3
      .brushX()
      .extent([[0, 0], [width, height]])
      .on('brush end', this.didBrush);
    this.selection = d3.select(this.brushNode);
    this.selection.call(this.brush);
    this.selection.call(this.brush.move, [0, width]);
    this.syncZoomingState();
  }

  componentDidUpdate(prevProps) {
    const { baseDomain, subDomain, width } = this.props;
    this.brush.extent([[0, 0], [this.props.width, this.props.height]]);
    const xScale = createXScale(baseDomain, width);
    const selection = subDomain.map(xScale);
    if (this.brushNode) {
      if (!this.props.zoomable) {
        this.selection.call(this.brush);
        this.selection.call(this.brush.move, selection);
        this.selection.on('.brush', null);
      } else {
        this.selection.call(this.brush.move, selection);
      }
    }
    if (!this.props.zoomable === prevProps.zoomable) {
      this.syncZoomingState();
    }
  }

  syncZoomingState() {
    if (this.props.zoomable) {
      this.selection.call(this.brush);
    } else {
      this.selection.on('.brush', null);
    }
  }

  updateXTransformation() {
    const { width, subDomain, baseDomain } = this.props;
    const selection = d3.event.selection || [0, width];
    const transform = d3.zoomIdentity
      .scale(width / (selection[1] - selection[0]))
      .translate(-selection[0], 0);
    const scale = createXScale(baseDomain, width);
    const currentSelection = subDomain.map(scale);
    if (!isEqual(selection, currentSelection)) {
      this.props.updateXTransformation(transform, width);
    }
  }

  didBrush = () => {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') {
      return;
    }
    if (!d3.event.sourceEvent) {
      return;
    }
    if (this.props.zoomable) {
      this.updateXTransformation();
    }
  };

  render() {
    const { height, width, baseDomain, contextSeries } = this.props;
    const xScale = createXScale(baseDomain, width);
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
          <g
            ref={r => {
              this.brushNode = r;
            }}
          />
        </svg>
        <XAxis width={width} height={50} domain={baseDomain} />
      </React.Fragment>
    );
  }
}

export const ScaledContextChart = props => (
  <ScalerContext.Consumer>
    {({ subDomain, baseDomain, updateXTransformation, contextSeries }) => (
      <ContextChart
        {...props}
        baseDomain={baseDomain}
        subDomain={subDomain}
        updateXTransformation={updateXTransformation}
        contextSeries={contextSeries}
      />
    )}
  </ScalerContext.Consumer>
);
