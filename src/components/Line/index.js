import React from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";

const Line = ({
  data,
  xAccessor,
  yAccessor,
  y0Accessor,
  y1Accessor,
  xScale,
  yScale,
  color,
  step,
  hidden,
  drawPoints,
  strokeWidth
}) => {
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
  let area = null;
  if (y0Accessor && y1Accessor) {
    area = d3
      .area()
      .x(d => xScale(xAccessor(d)))
      .y0(d => yScale(y0Accessor(d)))
      .y1(d => yScale(y1Accessor(d)));
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
      {area && (
        <path
          className="line-area"
          d={area(data)}
          style={{
            stroke: "none",
            strokeWidth: `${strokeWidth}px`,
            fill: `${color}`,
            opacity: 0.25,
            display: hidden ? "none" : "inherit"
          }}
        />
      )}
      <path
        className="line"
        d={line(data)}
        style={{
          stroke: color,
          strokeWidth: `${strokeWidth}px`,
          fill: "none",
          display: hidden ? "none" : "inherit"
        }}
      />
      {circles}
    </g>
  );
};

Line.propTypes = {
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  xAccessor: PropTypes.func.isRequired,
  yAccessor: PropTypes.func.isRequired,
  y0Accessor: PropTypes.func.isRequired,
  y1Accessor: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
  step: PropTypes.bool,
  hidden: PropTypes.bool,
  drawPoints: PropTypes.bool,
  strokeWidth: PropTypes.number
};

Line.defaultProps = {
  step: false,
  hidden: false,
  drawPoints: false,
  strokeWidth: 1
};

export default Line;
