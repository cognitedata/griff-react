import React from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import * as d3 from 'd3';

class Line extends React.Component {
  static propTypes = {
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
    data: PropTypes.array.isRequired,
    xAccessor: PropTypes.func.isRequired,
    yAccessor: PropTypes.func.isRequired,
    color: PropTypes.string.isRequired,
    step: PropTypes.bool,
    hidden: PropTypes.bool,
    drawPoints: PropTypes.bool,
    strokeWidth: PropTypes.number,
  };

  static defaultProps = {
    step: false,
    hidden: false,
    drawPoints: false,
    strokeWidth: 1,
  };

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const {
      data,
      xScale,
      yScale,
      color,
      hidden,
      step,
      heightPct,
      drawPoints,
      strokeWidth,
      xAccessor,
      yAccessor,
    } = this.props;
    if (!isEqual(xScale.domain(), nextProps.xScale.domain())) {
      return true;
    }
    if (!isEqual(xScale.range(), nextProps.xScale.range())) {
      return true;
    }
    if (!isEqual(yScale.range(), nextProps.yScale.range())) {
      return true;
    }
    if (!isEqual(yScale.domain(), nextProps.yScale.domain())) {
      return true;
    }
    if (color !== nextProps.color) {
      return true;
    }
    if (hidden !== nextProps.hidden) {
      return true;
    }
    if (step !== nextProps.step) {
      return true;
    }
    if (drawPoints !== nextProps.drawPoints) {
      return true;
    }
    if (strokeWidth !== nextProps.strokeWidth) {
      return true;
    }
    if (!isEqual(data, nextProps.data)) {
      return true;
    }
    if (
      xAccessor !== nextProps.xAccessor ||
      yAccessor !== nextProps.yAccessor
    ) {
      return true;
    }
    return false;
  }

  render() {
    const {
      data,
      xAccessor,
      yAccessor,
      xScale,
      yScale,
      color,
      step,
      hidden,
      drawPoints,
      strokeWidth,
    } = this.props;
    let line;
    if (step) {
      line = d3
        .line()
        .curve(d3.curveStepAfter)
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(yAccessor(d)));
    } else {
      line = d3
        .line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(yAccessor(d)));
    }
    let circles = null;
    if (drawPoints) {
      const subDomain = xScale.domain().map(p => p.getTime());
      circles = data
        .filter(d => {
          const x = xAccessor(d);
          return x >= subDomain[0] && x <= subDomain[1];
        })
        .map(d => (
          <circle
            key={xAccessor(d)}
            className="line-circle"
            r={3}
            cx={xScale(xAccessor(d))}
            cy={yScale(yAccessor(d))}
            fill={color}
          />
        ));
    }
    return (
      <g clipPath="url(#linechart-clip-path)">
        <path
          d={line(data)}
          style={{
            stroke: color,
            strokeWidth: `${strokeWidth}px`,
            fill: 'none',
            display: hidden ? 'none' : 'inherit',
          }}
        />
        {circles}
      </g>
    );
  }
}

export default Line;
