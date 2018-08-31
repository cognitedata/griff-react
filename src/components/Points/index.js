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
  yAccessor: accessorFuncPropType.isRequired,
  xScale: scaleFuncPropType.isRequired,
  yScale: scaleFuncPropType.isRequired,
  color: PropTypes.string.isRequired,
  opacity: PropTypes.number,
  opacityAccessor: PropTypes.func,
  pointWidth: PropTypes.number,
  pointWidthAccessor: PropTypes.func,
  strokeWidth: PropTypes.number,
  strokeWidthAccessor: PropTypes.func,
};
const defaultProps = {
  opacity: 1,
  opacityAccessor: null,
  pointWidth: null,
  pointWidthAccessor: null,
  strokeWidth: null,
  strokeWidthAccessor: null,
};

const Points = ({
  data,
  xAccessor,
  yAccessor,
  xScale,
  yScale,
  color,
  opacity,
  opacityAccessor,
  pointWidth,
  pointWidthAccessor,
  strokeWidth,
  strokeWidthAccessor,
}) => {
  const points = data.map(d => {
    let width = 0;
    if (strokeWidthAccessor) {
      width = strokeWidthAccessor(d);
    } else if (pointWidthAccessor) {
      width = pointWidthAccessor(d);
    } else if (pointWidth !== undefined && pointWidth !== null) {
      width = pointWidth;
    } else if (strokeWidth !== undefined && strokeWidth !== null) {
      width = strokeWidth;
    } else {
      width = 6;
    }
    return (
      <circle
        key={`${xAccessor(d)}-${yAccessor(d)}`}
        className="point"
        r={width / 2}
        opacity={opacityAccessor ? opacityAccessor(d) : opacity}
        cx={boundedSeries(xScale(xAccessor(d)))}
        cy={boundedSeries(yScale(yAccessor(d)))}
        fill={color}
      />
    );
  });
  return <g>{points}</g>;
};

Points.propTypes = propTypes;
Points.defaultProps = defaultProps;

export default Points;
