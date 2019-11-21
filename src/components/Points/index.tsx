import React from 'react';
import { boundedSeries } from 'utils/boundedseries';
import { Datapoint, PointRenderer, AccessorFunction } from 'external';
import { ScalerFunction } from 'utils/scale-helpers';

export interface Props {
  drawPoints?: boolean | PointRenderer;
  color?: string;
  opacity?: number;
  opacityAccessor?: AccessorFunction;
  pointFilter?: (d: Datapoint, i: number, arr: Datapoint[]) => boolean;
  pointWidth?: number;
  pointWidthAccessor?: AccessorFunction;
  strokeWidth?: number;
  data: Datapoint[];
  xAccessor: AccessorFunction;
  x0Accessor?: AccessorFunction;
  x1Accessor?: AccessorFunction;
  yAccessor: AccessorFunction;
  y0Accessor?: AccessorFunction;
  y1Accessor?: AccessorFunction;
  xScale: ScalerFunction;
  yScale: ScalerFunction;
}

const Points: React.FC<Props> = ({
  data,
  drawPoints = false,
  xAccessor,
  x0Accessor,
  x1Accessor,
  yAccessor,
  y0Accessor,
  y1Accessor,
  xScale,
  yScale,
  color,
  opacity = 1,
  opacityAccessor,
  pointFilter = () => true,
  pointWidth,
  pointWidthAccessor,
  strokeWidth,
}: Props) => {
  if (drawPoints === false) {
    return null;
  }

  const points = data.filter(pointFilter).map((d, i, arr) => {
    const [x, x0, x1] = [xAccessor, x0Accessor, x1Accessor].map(func => {
      if (!func) {
        return Number.NaN;
      }
      return +boundedSeries(xScale(func(d, i, arr)));
    });

    const [y, y0, y1] = [yAccessor, y0Accessor, y1Accessor].map(func => {
      if (!func) {
        return Number.NaN;
      }
      return +boundedSeries(yScale(func(d, i, arr)));
    });

    let width = 0;
    if (pointWidthAccessor) {
      width = pointWidthAccessor(d, i, arr);
    } else if (pointWidth !== undefined && pointWidth !== null) {
      width = pointWidth;
    } else if (strokeWidth !== undefined && strokeWidth !== null) {
      width = strokeWidth;
    } else {
      width = 6;
    }
    const uiElements = [];

    if (!Number.isNaN(x0) && !Number.isNaN(x1)) {
      uiElements.push(
        <line
          key={`horizontal-${x0},${y}-${x1},${y}`}
          x1={x0}
          y1={y}
          x2={x1}
          y2={y}
          stroke={color}
          strokeWidth={1}
        />
      );
    }

    if (!Number.isNaN(y0) && !Number.isNaN(y1)) {
      uiElements.push(
        <line
          key={`vertical-${x},${y0}-${x},${y1}`}
          x1={x}
          y1={y0}
          x2={x}
          y2={y1}
          stroke={color}
          strokeWidth={1}
        />
      );
    }

    if (!Number.isNaN(x) && !Number.isNaN(y)) {
      uiElements.push(
        <circle
          key={`${x}-${y}`}
          className="point"
          r={width / 2}
          opacity={opacityAccessor ? opacityAccessor(d, i, arr) : opacity}
          cx={x}
          cy={y}
          fill={color}
        />
      );
    }

    if (typeof drawPoints === 'function') {
      const metadata = {
        x,
        y,
        x0,
        x1,
        y0,
        y1,
        color,
        opacity,
        opacityAccessor,
        pointWidth,
        pointWidthAccessor,
        strokeWidth,
      };
      return drawPoints(d, i, arr, metadata, uiElements);
    }
    return uiElements;
  });
  return <g>{points}</g>;
};

export default Points;
