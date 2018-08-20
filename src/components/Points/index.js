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
  strokeWidth: PropTypes.number,
  strokeWidthAccessor: PropTypes.func,
};
const defaultProps = {
  opacity: 1,
  opacityAccessor: null,
  strokeWidth: 3,
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
  strokeWidth,
  strokeWidthAccessor,
}) => {
  const points = data.map(d => (
    <circle
      key={`${xAccessor(d)}-${yAccessor(d)}`}
      className="point"
      r={strokeWidthAccessor ? strokeWidthAccessor(d) : strokeWidth}
      opacity={opacityAccessor ? opacityAccessor(d) : opacity}
      cx={boundedSeries(xScale(xAccessor(d)))}
      cy={boundedSeries(yScale(yAccessor(d)))}
      fill={color}
    />
  ));
  return <g>{points}</g>;
};

Points.propTypes = propTypes;
Points.defaultProps = defaultProps;

export default Points;
