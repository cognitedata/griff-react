import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class RulerTooltip extends Component {
  static propTypes = {
    padding: PropTypes.number,
    labelHeight: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    contextWidth: PropTypes.number.isRequired,
  };

  static defaultProps = {
    padding: 10,
  };

  state = {
    textWidth: 0,
  };

  componentDidMount() {
    const textBBox = this.textRef.getBBox();
    this.setState({
      textWidth: textBBox.width,
    });
  }

  render() {
    const {
      labelHeight,
      color,
      label,
      x,
      y,
      padding,
      contextWidth,
    } = this.props;

    const xTranslate =
      x + padding + this.state.textWidth > contextWidth
        ? x - padding - padding - this.state.textWidth
        : x + padding;
    return (
      <g
        transform={`translate(${xTranslate}, ${y})`}
        style={{ cursor: 'default' }}
      >
        <rect
          fill="white"
          width={this.state.textWidth + padding}
          height={labelHeight}
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.5"
          rx={3}
          ry={3}
        />
        <text
          textAnchor="middle"
          alignmentBaseline="central"
          x={(this.state.textWidth + padding) / 2}
          y={labelHeight / 2}
          ref={ref => {
            this.textRef = ref;
          }}
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
