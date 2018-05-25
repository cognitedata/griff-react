import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  padding: PropTypes.number,
  labelHeight: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

const defaultProps = {
  padding: 10,
};

class RulerTooltip extends Component {
  state = {
    textWidth: 0,
  };

  componentDidMount() {
    const textBBox = this.textRef.getBBox();

    // we can't know in advance the text width has been already set
    // so as far as it is synchronous operation we can run setState
    // right after all the sync operations finish
    setTimeout(() =>
      this.setState({
        textWidth: textBBox.width,
      })
    );
  }

  render() {
    const { labelHeight, color, label, x, y, padding, width } = this.props;

    const xTranslate =
      x + padding + this.state.textWidth > width
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
          opacity="0.9"
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

RulerTooltip.propTypes = propTypes;
RulerTooltip.defaultProps = defaultProps;

export default RulerTooltip;
