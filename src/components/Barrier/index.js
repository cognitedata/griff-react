import React from 'react';
import { barrierShape } from '../../utils/proptypes';

// HTML has an issue with drawing points somewhere in the 30-35M range.
// There's no point in drawing pixels more than 30k pixels outside of the range
// so this hack will work for a while.
// Without this, when zoomed far enough in the line will disappear.
const boundedValue = value => Math.min(Math.max(value, -30000), 30000);

const Barrier = ({ yMax, yMin, yScale, width, color, fillOpacity, id }) => (
  <rect
    key={id}
    className={`barrier-${id}`}
    x={0}
    y={boundedValue(yScale(yMax))}
    height={boundedValue(yScale(yMin)) - boundedValue(yScale(yMax))}
    width={width}
    style={{ stroke: color, fill: color, fillOpacity }}
  />
);

Barrier.propTypes = barrierShape;

Barrier.defaultProps = {
  color: '#e8336d',
  fillOpacity: 0.1,
  yMin: Number.MIN_SAFE_INTEGER,
  yMax: Number.MAX_SAFE_INTEGER,
};

export default Barrier;
