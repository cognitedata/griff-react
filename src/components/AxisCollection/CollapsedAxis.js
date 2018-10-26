import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { createYScale } from '../../utils/scale-helpers';
import GriffPropTypes from '../../utils/proptypes';
import AxisPlacement from '../AxisPlacement';

export default class CollapsedAxis extends Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    offsetx: PropTypes.number,
    color: PropTypes.string,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    yAxisPlacement: GriffPropTypes.axisPlacement,
  };

  static defaultProps = {
    color: '#666',
    offsetx: 0,
    onMouseEnter: null,
    onMouseLeave: null,
    yAxisPlacement: AxisPlacement.RIGHT,
  };

  getPath = ({ offsetx, strokeWidth, tickSizeOuter, range }) => {
    const { yAxisPlacement, width } = this.props;
    switch (yAxisPlacement) {
      case AxisPlacement.LEFT:
        return [
          // Move to this (x,y); start drawing
          `M ${width - offsetx} ${strokeWidth}`,
          // Draw a horizontal line to the left
          `h ${tickSizeOuter - strokeWidth}`,
          // Draw a vertical line from top to bottom
          `v ${range[0] - strokeWidth * 2}`,
          // Finish with another horizontal line
          `h -${tickSizeOuter - strokeWidth / 2}`,
        ].join(' ');
      case AxisPlacement.BOTH:
        throw new Error(
          'BOTH is not a valid option for CollapsedAxis -- please specify RIGHT or LEFT'
        );
      case AxisPlacement.RIGHT:
      case AxisPlacement.UNSPECIFIED:
      default:
        return [
          // Move to this (x,y); start drawing
          `M ${offsetx} ${strokeWidth}`,
          // Draw a horizontal line to the left
          `h -${tickSizeOuter - strokeWidth}`,
          // Draw a vertical line from top to bottom
          `v ${range[0] - strokeWidth * 2}`,
          // Finish with another horizontal line
          `h ${tickSizeOuter - strokeWidth / 2}`,
        ].join(' ');
    }
  };

  renderAxis() {
    const { color, height, onMouseEnter, onMouseLeave } = this.props;
    const scale = createYScale([0, 100], height);
    const axis = d3.axisRight(scale);
    const tickFontSize = 14;
    const strokeWidth = 2;
    const tickSizeOuter = axis.tickSizeOuter();
    const range = scale.range();
    const paths = {};
    let offsetx = 0;
    for (let i = 1; i < 4; i += 1) {
      offsetx += tickSizeOuter;
      paths[i] = {
        path: this.getPath({ offsetx, strokeWidth, tickSizeOuter, range }),
        color,
        opacity: 1 - (i - 1) / 4,
      };

      offsetx += 3;
    }
    return (
      <g
        className="axis"
        fill="none"
        fontSize={tickFontSize}
        textAnchor="start"
        strokeWidth={strokeWidth}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {Object.keys(paths).map(key => (
          <path
            key={key}
            stroke={paths[key].color}
            opacity={paths[key].opacity || 1}
            d={paths[key].path}
          />
        ))}
      </g>
    );
  }

  render() {
    const { offsetx } = this.props;
    return (
      <g
        className="axis-y collapsed-axis-y"
        transform={`translate(${offsetx}, 0)`}
      >
        {this.renderAxis()}
      </g>
    );
  }
}
