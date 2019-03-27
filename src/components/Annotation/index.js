import React from 'react';
import { annotationShape } from '../../utils/proptypes';

// HTML has an issue with drawing points somewhere in the 30-35M range.
// There's no point in drawing pixels more than 30k pixels outside of the range
// so this hack will work for a while.
// Without this, when zoomed far enough in the line will disappear.
const boundedValue = value => Math.min(Math.max(value, -30000), 30000);

const Annotation = ({
  timeBounds,
  seriesBounds,
  xScale,
  yScale,
  height,
  width,
  color,
  fillOpacity,
  id,
}) => {
  const xBounds = { min: 0, max: 0 };
  const yBounds = { min: 0, max: 0 };

  if (timeBounds) {
    xBounds.min = timeBounds.min
      ? xScale(timeBounds.min || Number.MIN_SAFE_INTEGER)
      : 0;
    xBounds.max = timeBounds.max
      ? xScale(timeBounds.max || Number.MAX_SAFE_INTEGER)
      : Number.MAX_SAFE_INTEGER;
  }

  if (seriesBounds) {
    yBounds.min =
      yScale && seriesBounds.min
        ? yScale(seriesBounds.min || Number.MIN_SAFE_INTEGER)
        : 0;

    yBounds.max =
      yScale && seriesBounds.max
        ? yScale(seriesBounds.max || Number.MAX_SAFE_INTEGER)
        : Number.MAX_SAFE_INTEGER;
  }

  return (
    <rect
      key={id}
      className={`griff-annotation griff-annotation-${id}`}
      x={boundedValue(xBounds.min)}
      y={boundedValue(yBounds.min)}
      height={
        seriesBounds
          ? Math.abs(boundedValue(yBounds.max - yBounds.min))
          : height
      }
      width={
        timeBounds ? Math.abs(boundedValue(xBounds.max - xBounds.min)) : width
      }
      style={{ stroke: color, fill: color, fillOpacity }}
    />
  );
};

Annotation.propTypes = annotationShape;

Annotation.defaultProps = {
  color: '#e8336d',
  fillOpacity: 0.1,
};

export default Annotation;
