import React from 'react';
import { areaPropType } from '../../utils/proptypes';

const Area = ({ start, end, color = '#f00', opacity = 0.25 }) => {
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
  ...areaPropType,
};

Area.defaultProps = {};

export default Area;
