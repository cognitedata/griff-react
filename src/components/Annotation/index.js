import React from 'react';
import { annotationShape } from '../../utils/proptypes';
import { boundedSeries } from '../utils/boundedseries';

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
      x={boundedSeries(xBounds.min)}
      y={boundedSeries(yBounds.min)}
      height={
        seriesBounds
          ? Math.abs(boundedSeries(yBounds.max - yBounds.min))
          : height
      }
      width={
        timeBounds ? Math.abs(boundedSeries(xBounds.max - xBounds.min)) : width
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
