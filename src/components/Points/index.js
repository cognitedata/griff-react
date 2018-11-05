import React from 'react';
import PropTypes from 'prop-types';
import GriffPropTypes, {
  dataPointPropType,
  accessorFuncPropType,
  scaleFuncPropType,
} from '../../utils/proptypes';
import { boundedSeries } from '../../utils/boundedseries';

const propTypes = {
  data: PropTypes.arrayOf(dataPointPropType).isRequired,
  drawPoints: GriffPropTypes.drawPoints,
  xAccessor: accessorFuncPropType.isRequired,
  x0Accessor: accessorFuncPropType,
  x1Accessor: accessorFuncPropType,
  yAccessor: accessorFuncPropType.isRequired,
  y0Accessor: accessorFuncPropType,
  y1Accessor: accessorFuncPropType,
  xScale: scaleFuncPropType.isRequired,
  yScale: scaleFuncPropType.isRequired,
  color: PropTypes.string.isRequired,
  opacity: PropTypes.number,
  opacityAccessor: PropTypes.func,
  pointWidth: PropTypes.number,
  pointWidthAccessor: PropTypes.func,
  strokeWidth: PropTypes.number,
};

const defaultProps = {
  drawPoints: false,
  opacity: 1,
  opacityAccessor: null,
  pointWidth: null,
  pointWidthAccessor: null,
  strokeWidth: null,
  x0Accessor: null,
  x1Accessor: null,
  y0Accessor: null,
  y1Accessor: null,
};

const defaultMinMaxAccessor = () => undefined;

const Points = ({
  data,
  drawPoints,
  xAccessor,
  x0Accessor,
  x1Accessor,
  yAccessor,
  y0Accessor,
  y1Accessor,
  xScale,
  yScale,
  color,
  opacity,
  opacityAccessor,
  pointWidth,
  pointWidthAccessor,
  strokeWidth,
}) => {
  if (drawPoints === false) {
    return null;
  }

  const points = data.map((d, i, arr) => {
    const [x, x0, x1] = [
      xAccessor,
      x0Accessor || defaultMinMaxAccessor,
      x1Accessor || defaultMinMaxAccessor,
    ].map(f => boundedSeries(xScale(f(d))));

    const [y, y0, y1] = [
      yAccessor,
      y0Accessor || defaultMinMaxAccessor,
      y1Accessor || defaultMinMaxAccessor,
    ].map(f => boundedSeries(yScale(f(d))));

    let width = 0;
    if (pointWidthAccessor) {
      width = pointWidthAccessor(d);
    } else if (pointWidth !== undefined && pointWidth !== null) {
      width = pointWidth;
    } else if (strokeWidth !== undefined && strokeWidth !== null) {
      width = strokeWidth;
    } else {
      width = 6;
    }
    const uiElements = [];

    if (!Number.isNaN(x0) && !Number.isNaN(x1)) {
      uiElements.push(
        <line
          key={`${x0},${y}-${x1},${y}`}
          x1={x0}
          y1={y}
          x2={x1}
          y2={y}
          stroke={color}
          strokeWidth={1}
        />
      );
    }

    if (!Number.isNaN(y0) && !Number.isNaN(y1)) {
      uiElements.push(
        <line
          key={`${x},${y0}-${x},${y1}`}
          x1={x}
          y1={y0}
          x2={x}
          y2={y1}
          stroke={color}
          strokeWidth={1}
        />
      );
    }

    uiElements.push(
      <circle
        key={`${x}-${y}`}
        className="point"
        r={width / 2}
        opacity={opacityAccessor ? opacityAccessor(d) : opacity}
        cx={x}
        cy={y}
        fill={color}
      />
    );

    if (typeof drawPoints === 'function') {
      const metadata = {
        x,
        y,
        x0,
        x1,
        y0,
        y1,
        color,
        opacity,
        opacityAccessor,
        pointWidth,
        pointWidthAccessor,
        strokeWidth,
      };
      return drawPoints(d, i, arr, metadata, uiElements);
    }
    return uiElements;
  });
  return <g>{points}</g>;
};

Points.propTypes = propTypes;
Points.defaultProps = defaultProps;

export default Points;
