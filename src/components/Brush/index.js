// Not implemented yet. Should write our own brush component,
// that's the last thing we're not handling ourselves - will mess up rendering cycle (i think)

import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { createXScale } from '../../utils/scale-helpers';

class Brush extends React.Component {
  componentDidMount() {
    const { width, height } = this.props;
    this.brush = d3
      .brushX()
      .extent([[0, 0], [width, height]])
      .on('brush end', this.didBrush);
    this.selection = d3.select(this.brushNode);
    this.selection.call(this.brush);
  }

  didBrush = () => {};

  render() {
    const { width, height, selectionColor, baseDomain, subDomain } = this.props;
    const xScale = createXScale(baseDomain, width);
    const selection = subDomain.map(xScale);
    const selectionWidth = selection[1] - selection[0];
    return (
      <g pointerEvents="all" ref={this.brushNode}>
        <rect
          className="overlay"
          pointerEvents="all"
          cursor="crosshair"
          x={0}
          y={0}
          width={width}
          height={height}
        />
        <rect
          className="selection"
          cursor="move"
          fill={selectionColor}
          fillOpacity={0.3}
          stroke="#777"
          shapeRendering="crispEdges"
          width={selectionWidth}
          height={height}
          x={selection[0]}
          y={0}
        />
        <rect
          className="handle handle--e"
          cursor="ew-resize"
          x={selection[0] - 5}
          y="-3"
          width={10}
          height={86}
        />
        <rect
          className="handle handle--w"
          cursor="ew-resize"
          x={selection[1] - 5}
          y="-3"
          width={10}
          height={86}
        />
      </g>
    );
  }
}

Brush.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  selectionColor: PropTypes.string,
};

Brush.defaultProps = {
  selectionColor: '#777',
};

export default Brush;
