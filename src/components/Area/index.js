import React from 'react';
import PropTypes from 'prop-types';
import { coordinatePropType } from '../../utils/proptypes';

const Area = ({ start, end, color, opacity }) => {
  if (!start || !end) {
    return null;
  }
  const width = Math.abs(start.xpos - end.xpos);
  const left = Math.min(start.xpos, end.xpos);
  const height = Math.abs(start.ypos - end.ypos);
  const top = Math.min(start.ypos, end.ypos);
  return (
    <rect
      width={width}
      height={height}
      x={left}
      y={top}
      pointerEvents="none"
      style={{ stroke: color, fill: color, fillOpacity: opacity }}
    />
  );
};

Area.propTypes = {
  color: PropTypes.string,
  start: coordinatePropType.isRequired,
  end: coordinatePropType,
  opacity: PropTypes.number,
};

Area.defaultProps = {
  color: '#000',
  opacity: 0.15,
  end: null,
};

export default Area;
