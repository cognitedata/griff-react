import React from 'react';
import { annotationPropType } from '../../utils/proptypes';

const Annotation = ({ data, xScale, height, color, fillOpacity, id }) => (
  <rect
    key={id}
    x={xScale(data[0])}
    y={0}
    height={height}
    width={xScale(data[1]) - xScale(data[0])}
    style={{ stroke: color, fill: color, fillOpacity }}
  />
);

Annotation.propTypes = annotationPropType;

Annotation.defaultProps = {
  color: '#e8336d',
  fillOpacity: 0.1,
};

export default Annotation;
