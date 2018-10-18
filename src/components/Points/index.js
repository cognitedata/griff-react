import React from 'react';
import PropTypes from 'prop-types';
import {
  dataPointPropType,
  accessorFuncPropType,
  scaleFuncPropType,
} from '../../utils/proptypes';
import { boundedSeries } from '../../utils/boundedseries';

const propTypes = {
  data: PropTypes.arrayOf(dataPointPropType).isRequired,
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

const Points = ({
  data,
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
  const getX = x => boundedSeries(xScale(x));
  const getY = y => boundedSeries(yScale(y));
  const points = data.map(d => {
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

    const cx = getX(xAccessor(d));
    const cy = getY(yAccessor(d));

    if (x0Accessor && x1Accessor && y0Accessor && y1Accessor) {
      const [x0, x1, y0, y1] = [
        x0Accessor,
        x1Accessor,
        y0Accessor,
        y1Accessor,
      ].map(f => f(d));
      const polygon = [
        // left
        `${getX(x0)},${cy}`,
        // top
        `${cx},${getY(y1)}`,
        // right
        `${getX(x1)},${cy}`,
        // bottom
        `${cx},${getY(y0)}`,
      ].join(' ');
      uiElements.push(
        <polygon
          key={`${x0},${y0}-${x1},${y1}`}
          className="point-area"
          points={polygon}
          fill={color}
          fillOpacity={0.25}
          stroke={color}
          strokeWidth={1}
        />
      );
    }

    uiElements.push(
      <circle
        key={`${xAccessor(d)}-${yAccessor(d)}`}
        className="point"
        r={width / 2}
        opacity={opacityAccessor ? opacityAccessor(d) : opacity}
        cx={cx}
        cy={cy}
        fill={color}
      />
    );
    return uiElements;
  });
  return <g>{points}</g>;
};

Points.propTypes = propTypes;
Points.defaultProps = defaultProps;

export default Points;
