import React from 'react';
import PropTypes from 'prop-types';
import {
  dataPointPropType,
  accessorFuncPropType,
  scaleFuncPropType,
} from '../../utils/proptypes';

const propTypes = {
  data: PropTypes.arrayOf(dataPointPropType).isRequired,
  xAccessor: accessorFuncPropType.isRequired,
  yAccessor: accessorFuncPropType.isRequired,
  xScale: scaleFuncPropType.isRequired,
  yScale: scaleFuncPropType.isRequired,
  color: PropTypes.string.isRequired,
  strokeWidth: PropTypes.number,
};
const defaultProps = {
  strokeWidth: 3,
};

const Points = ({
  data,
  xAccessor,
  yAccessor,
  xScale,
  yScale,
  color,
  strokeWidth,
}) => {
  const points = data.map(d => (
    <circle
      key={`${xAccessor(d)}-${yAccessor(d)}`}
      className="scatterplot-point"
      r={strokeWidth}
      cx={xScale(xAccessor(d))}
      cy={yScale(yAccessor(d))}
      fill={color}
    />
  ));
  return <g>{points}</g>;
};

Points.propTypes = propTypes;
Points.defaultProps = defaultProps;

export default Points;
