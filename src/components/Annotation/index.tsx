import * as React from 'react';
import { annotationShape } from '../../utils/proptypes';
import { ItemId } from '../../external';
import { ScalerFunction } from '../../utils/scale-helpers';

export interface Props {
  /** Two timestamps representing the bounds of this annotation. */
  data: [number, number];
  xScale: ScalerFunction;
  height: number;
  color?: string;
  fillOpacity?: number;
  id: ItemId;
}

const Annotation: React.FunctionComponent<Props> = ({
  data,
  xScale,
  height,
  color = '#e8336d',
  fillOpacity = 0.1,
  id,
}) => (
  <rect
    key={id}
    className={`griff-annotation griff-annotation-${id}`}
    x={xScale(data[0])}
    y={0}
    height={height}
    width={xScale(data[1]) - xScale(data[0])}
    style={{ stroke: color, fill: color, fillOpacity }}
  />
);

Annotation.propTypes = annotationShape;

export default Annotation;
