import React from 'react';
import * as d3 from 'd3';
import Points from 'components/Points';
import { boundedSeries } from 'utils/boundedseries';
import { ScalerFunction } from 'utils/scale-helpers';
import { AccessorFunction, Datapoint, ItemId } from 'external';

export interface Props {
  id: ItemId;
  data: Datapoint[];
  xScale: ScalerFunction;
  xAxisAccessor: AccessorFunction;
  yScale: ScalerFunction;
  yAccessor: AccessorFunction;
  y0Accessor?: AccessorFunction;
  y1Accessor?: AccessorFunction;
  color?: string;
  step?: boolean;
  hidden?: boolean;
  drawPoints?: boolean;
  strokeWidth?: number;
  opacity?: number;
  opacityAccessor?: AccessorFunction;
  pointWidth?: number;
  pointWidthAccessor?: AccessorFunction;
  clipPath: string;
}

const Line: React.FC<Props> = ({
  id,
  data,
  xAxisAccessor,
  xScale,
  yAccessor,
  y0Accessor,
  y1Accessor,
  yScale,
  color = '#000',
  step = false,
  hidden = false,
  drawPoints = false,
  strokeWidth = 1,
  opacity = 1,
  opacityAccessor,
  pointWidth = 6,
  pointWidthAccessor,
  clipPath,
}: Props) => {
  let area;
  const curve = step ? d3.curveStepAfter : d3.curveLinear;
  const line = d3
    .line()
    .curve(curve)
    .x(d =>
      boundedSeries(
        // @ts-ignore - I'm pretty sure that d3 has the wrong type annotations.
        xScale(xAxisAccessor(d))
      )
    )
    .y(d =>
      boundedSeries(
        // @ts-ignore - I'm pretty sure that d3 has the wrong type annotations.
        yScale(yAccessor(d))
      )
    );
  if (drawPoints !== true && y0Accessor && y1Accessor) {
    area = d3
      .area()
      .curve(curve)
      .x(d =>
        boundedSeries(
          // @ts-ignore - I'm pretty sure that d3 has the wrong type annotations.
          xScale(xAxisAccessor(d))
        )
      )
      .y0(d =>
        boundedSeries(
          // @ts-ignore - I'm pretty sure that d3 has the wrong type annotations.
          yScale(y0Accessor(d))
        )
      )
      .y1(d =>
        boundedSeries(
          // @ts-ignore - I'm pretty sure that d3 has the wrong type annotations.
          yScale(y1Accessor(d))
        )
      );
  }
  let circles = null;
  if (drawPoints) {
    const xSubDomain = xScale.domain();
    circles = (
      <Points
        data={data.filter(d => {
          const x = xAxisAccessor(d);
          return x >= xSubDomain[0] && x <= xSubDomain[1];
        })}
        opacity={opacity}
        opacityAccessor={opacityAccessor}
        drawPoints={drawPoints}
        xAccessor={xAxisAccessor}
        yAccessor={yAccessor}
        xScale={xScale}
        yScale={yScale}
        color={color}
        pointWidth={pointWidth}
        pointWidthAccessor={pointWidthAccessor}
      />
    );
  }
  return (
    <g clipPath={`url(#${clipPath})`}>
      {area && (
        <path
          className="line-area"
          d={area(
            // @ts-ignore - I'm pretty sure that d3 has the wrong type annotations.
            data
          )}
          style={{
            stroke: color,
            strokeOpacity: 0,
            strokeWidth: `${strokeWidth}px`,
            fill: color,
            fillOpacity: 0.25,
            opacity: 1,
            display: hidden ? 'none' : 'inherit',
          }}
        />
      )}
      <path
        data-testid={`Line-${id}`}
        className="line"
        d={line(
          // @ts-ignore - I'm pretty sure that d3 has the wrong type annotations.
          data
        )}
        style={{
          stroke: color,
          strokeWidth: `${strokeWidth}px`,
          strokeOpacity: opacity,
          fill: 'none',
          display: hidden ? 'none' : 'inherit',
        }}
      />
      {circles}
    </g>
  );
};

export default Line;
