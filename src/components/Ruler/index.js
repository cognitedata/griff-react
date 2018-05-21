import React, { Component } from 'react';
import RulerTooltip from '../RulerTooltip';

const labelHeight = 24;

export default class Ruler extends Component {
  static propTypes = {};

  static defaultProps = {};

  state = {};

  render() {
    const { ruler, points, colors, effectiveHeight, contextWidth } = this.props;

    if (!points.length) {
      return null;
    }

    const firstPoint = points[0];

    return (
      <React.Fragment>
        <line
          y1={0}
          y2={effectiveHeight}
          stroke="#ccc"
          strokeWidth="1"
          x1={firstPoint.x}
          x2={firstPoint.x}
        />
        <RulerTooltip
          labelHeight={labelHeight}
          color={colors[firstPoint.key]}
          label={ruler.xLabel(firstPoint)}
          x={firstPoint.x}
          y={effectiveHeight - labelHeight - 5}
          contextWidth={contextWidth}
        />
        {points.map(point => [
          <RulerTooltip
            key={point.key}
            labelHeight={labelHeight}
            color={colors[point.key]}
            label={ruler.yLabel(point)}
            x={point.x}
            y={point.y - labelHeight / 2}
            contextWidth={contextWidth}
          />,
          <circle
            key={`circle${point.key}`}
            r={3}
            cx={point.x}
            cy={point.y}
            fill={colors[point.key]}
            stroke={colors[point.key]}
            strokeWidth="3"
            strokeOpacity="0.5"
          />,
        ])};
      </React.Fragment>
    );
  }
}
