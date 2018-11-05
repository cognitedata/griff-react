import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import Points from '../Points';
import { boundedSeries } from '../../utils/boundedseries';

const Line = ({
  data,
  xAxisAccessor,
  xScale,
  yAccessor,
  y0Accessor,
  y1Accessor,
  yScale,
  color,
  step,
  hidden,
  drawPoints,
  strokeWidth,
  opacity,
  pointWidth,
  pointWidthAccessor,
  clipPath,
}) => {
  let line;
  let area;
  if (step) {
    line = d3
      .line()
      .curve(d3.curveStepAfter)
      .x(d => boundedSeries(xScale(xAxisAccessor(d))))
      .y(d => boundedSeries(yScale(yAccessor(d))));
    if (!drawPoints && y0Accessor && y1Accessor) {
      area = d3
        .area()
        .curve(d3.curveStepAfter)
        .x(d => boundedSeries(xScale(xAxisAccessor(d))))
        .y0(d => boundedSeries(yScale(y0Accessor(d))))
        .y1(d => boundedSeries(yScale(y1Accessor(d))));
    }
  } else {
    line = d3
      .line()
      .x(d => boundedSeries(xScale(xAxisAccessor(d))))
      .y(d => boundedSeries(yScale(yAccessor(d))));
    if (!drawPoints && y0Accessor && y1Accessor) {
      area = d3
        .area()
        .x(d => boundedSeries(xScale(xAxisAccessor(d))))
        .y0(d => boundedSeries(yScale(y0Accessor(d))))
        .y1(d => boundedSeries(yScale(y1Accessor(d))));
    }
  }
  let circles = null;
  if (drawPoints) {
    const xSubDomain = xScale.domain().map(p => p.getTime());
    circles = (
      <Points
        data={data.filter(d => {
          const x = xAxisAccessor(d);
          return x >= xSubDomain[0] && x <= xSubDomain[1];
        })}
        xAccessor={xAxisAccessor}
        yAccessor={yAccessor}
        xScale={xScale}
        yScale={yScale}
        color={color}
        pointWidth={pointWidth}
        pointWidthAccessor={pointWidthAccessor}
      />
    );
  }
  return (
    <g clipPath={`url(#${clipPath})`}>
      {area && (
        <path
          className="line-area"
          d={area(data)}
          style={{
            stroke: color,
            strokeOpacity: 0,
            strokeWidth: `${strokeWidth}px`,
            fill: color,
            fillOpacity: 0.25,
            opacity: 1,
            display: hidden ? 'none' : 'inherit',
          }}
        />
      )}
      <path
        className="line"
        d={line(data)}
        style={{
          stroke: color,
          strokeWidth: `${strokeWidth}px`,
          strokeOpacity: opacity,
          fill: 'none',
          display: hidden ? 'none' : 'inherit',
        }}
      />
      {circles}
    </g>
  );
};

Line.propTypes = {
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
  // eslint-disable-next-line
  data: PropTypes.array.isRequired,
  // Data can take any form as long as the xAxisAccessor and yAccessors are set.
  xAxisAccessor: PropTypes.func.isRequired,
  yAccessor: PropTypes.func.isRequired,
  y0Accessor: PropTypes.func,
  y1Accessor: PropTypes.func,
  color: PropTypes.string.isRequired,
  step: PropTypes.bool,
  hidden: PropTypes.bool,
  drawPoints: PropTypes.bool,
  opacity: PropTypes.number,
  pointWidth: PropTypes.number,
  pointWidthAccessor: PropTypes.func,
  strokeWidth: PropTypes.number,
  clipPath: PropTypes.string.isRequired,
};

Line.defaultProps = {
  step: false,
  hidden: false,
  drawPoints: false,
  opacity: 1,
  pointWidth: 6,
  pointWidthAccessor: null,
  strokeWidth: 1,
  y0Accessor: null,
  y1Accessor: null,
};

export default Line;
