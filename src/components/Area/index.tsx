import * as React from 'react';
import * as PropTypes from 'prop-types';
import { coordinatePropType } from '../../utils/proptypes';

export interface Position {
  xpos: number;
  ypos: number;
}

export interface Props {
  start: Position;
  end: Position;
  color?: string;
  opacity?: number;
}

const Area: React.FunctionComponent<Props> = ({
  start,
  end,
  color = '#000',
  opacity = 0.15,
}) => {
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
  end: coordinatePropType.isRequired,
  opacity: PropTypes.number,
};

Area.defaultProps = {
  color: '#000',
  opacity: 0.15,
};

export default Area;
