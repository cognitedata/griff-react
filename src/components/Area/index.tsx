import React from 'react';
import * as PropTypes from 'prop-types';

export interface Position {
  xpos: number;
  ypos: number;
}

export interface Props {
  id: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  color?: string;
  opacity?: number;
}

const Area: React.FunctionComponent<Props> = ({
  id,
  xMin,
  xMax,
  yMin,
  yMax,
  color = '#000',
  opacity = 0.15,
}) => {
  const width = Math.abs(xMax - xMin);
  const height = Math.abs(yMax - yMin);
  return (
    <rect
      className={`area area-${id}`}
      width={width}
      height={height}
      x={xMin}
      y={yMax}
      pointerEvents="none"
      style={{ stroke: color, fill: color, fillOpacity: opacity }}
    />
  );
};

Area.propTypes = {
  id: PropTypes.string.isRequired,
  color: PropTypes.string,
  xMin: PropTypes.number.isRequired,
  xMax: PropTypes.number.isRequired,
  yMin: PropTypes.number.isRequired,
  yMax: PropTypes.number.isRequired,
  opacity: PropTypes.number,
};

Area.defaultProps = {
  color: '#000',
  opacity: 0.15,
};

export default Area;
