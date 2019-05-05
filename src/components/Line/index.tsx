import * as React from 'react';
import * as d3 from 'd3';
import Points from '../Points';
import { boundedSeries } from '../../utils/boundedseries';
import { ScalerFunction } from '../../utils/scale-helpers';
import { AccessorFunction, Datapoint } from '../../external';

export interface Props {
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

const Line: React.FunctionComponent<Props> = ({
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
}) => {
  let area;
  const curve = step ? d3.curveStepAfter : d3.curveLinear;
  const line = d3
    .line()
    .curve(curve)
    .x(d =>
      boundedSeries(
        xScale(
          xAxisAccessor(
            // @ts-ignore - I'm pretty sure that d3 has the wrong type annotations.
            d
          )
        )
      )
    )
    .y(d =>
      boundedSeries(
        yScale(
          yAccessor(
            // @ts-ignore - I'm pretty sure that d3 has the wrong type annotations.
            d
          )
        )
      )
    );
  if (drawPoints !== true && y0Accessor && y1Accessor) {
    area = d3
      .area()
      .curve(curve)
      .x(d =>
        boundedSeries(
          xScale(
            xAxisAccessor(
              // @ts-ignore - I'm pretty sure that d3 has the wrong type annotations.
              d
            )
          )
        )
      )
      .y0(d =>
        boundedSeries(
          yScale(
            y0Accessor(
              // @ts-ignore - I'm pretty sure that d3 has the wrong type annotations.
              d
            )
          )
        )
      )
      .y1(d =>
        boundedSeries(
          yScale(
            y1Accessor(
              // @ts-ignore - I'm pretty sure that d3 has the wrong type annotations.
              d
            )
          )
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
