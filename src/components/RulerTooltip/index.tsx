import * as React from 'react';

export interface Props {
  labelHeight?: number;
  color: string;
  label: string;
  x: number;
  y: number;
  chartWidth: number;
  padding?: number;
  offset?: number;
}

interface State {
  textWidth: number;
  textHeight: number;
}

class RulerTooltip extends React.Component<Props, State> {
  state = {
    textWidth: 0,
    textHeight: 0,
  };

  onTooltipRef = (ref: SVGTextElement) => {
    if (ref) {
      this.setState({
        textWidth: ref.getBBox().width,
        textHeight: ref.getBBox().height,
      });
    }
  };

  render() {
    const {
      labelHeight,
      color,
      label,
      x,
      y,
      padding = 10,
      chartWidth,
      offset = 10,
    } = this.props;
    const { textHeight, textWidth } = this.state;

    const xTranslate =
      x + (padding + offset) + textWidth > chartWidth
        ? x - padding - offset - textWidth
        : x + offset;

    const height = (labelHeight || textHeight) + padding;

    return (
      <g
        transform={`translate(${xTranslate}, ${y})`}
        style={{ cursor: 'default' }}
        className="ruler-tooltip"
      >
        <rect
          className="ruler-tooltip-fill"
          fill="white"
          width={textWidth + padding}
          height={height}
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.5"
          opacity="0.9"
          rx={3}
          ry={3}
        />
        <text
          className="ruler-tooltip-text"
          textAnchor="middle"
          alignmentBaseline="central"
          x={(textWidth + padding) / 2}
          y={height / 2}
          ref={this.onTooltipRef}
          style={{
            fontSize: '14px',
            color: '#333333',
            fill: '#333333',
          }}
        >
          {label}
        </text>
      </g>
    );
  }
}

export default RulerTooltip;
