import React from 'react';
import { ItemId } from 'external';
import { ScalerFunction } from 'utils/scale-helpers';

export interface Props {
  /** Two timestamps representing the bounds of this annotation. */
  data: [number, number];
  xScale: ScalerFunction;
  height: number;
  color?: string;
  fillOpacity?: number;
  id: ItemId;
}

const Annotation: React.FC<Props> = ({
  data,
  xScale,
  height,
  color = '#e8336d',
  fillOpacity = 0.1,
  id,
}: Props) => (
  <rect
    key={id}
    className={`griff-annotation griff-annotation-${id}`}
    x={xScale(data[0])}
    y={0}
    height={height}
    // @ts-ignore
    width={xScale(data[1]) - xScale(data[0])}
    style={{ stroke: color, fill: color, fillOpacity }}
  />
);

export default Annotation;
