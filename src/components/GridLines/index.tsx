import React from 'react';
import ScalerContext from '../../context/Scaler';
import { createYScale, createXScale } from '../../utils/scale-helpers';
import Axes from '../../utils/Axes';
import { ItemId, Series } from '../../external';
import { DomainsByItemId } from '../Scaler/index';
import { SizeProps, ItemIdMap } from '../../internal';
import { withDisplayName } from '../../utils/displayName';

export interface GridX {
  pixels?: number;
  count?: number;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  ticks?: number;
}

export interface GridY {
  pixels?: number;
  seriesIds?: ItemId[];
  count?: number;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  ticks?: number;
}

export interface Props extends InternalProps, SizeProps {
  axes?: {
    x: 'time' | 'x';
  };
  color?: string;
  opacity?: number;
  strokeWidth?: number;
  x?: GridX;
  y?: GridY;
}

interface InternalProps {
  series: Series[];
  subDomainsByItemId: DomainsByItemId;
}

const GridLines: React.FC<Props> = ({
  axes = { x: 'x' },
  color = '#666',
  height,
  opacity = 0.6,
  series,
  strokeWidth = 1,
  subDomainsByItemId,
  width,
  x,
  y,
}: Props) => {
  if (!x && !y) {
    return null;
  }

  const lines = [];

  if (y) {
    if (y.seriesIds) {
      const seriesIdMap: ItemIdMap<Series> = y.seriesIds.reduce(
        (dict, id) => ({ ...dict, [id]: true }),
        {}
      );
      series
        .filter(s => seriesIdMap[s.id])
        .forEach(s => {
          // This is heavily inspired by YAxis -- maybe we could consolidate?
          const scale = createYScale(Axes.y(subDomainsByItemId[s.id]), height);
          const nTicks = y.count || Math.floor(height / 50) || 1;
          const values = scale.ticks(nTicks);

          values.forEach(v => {
            lines.push(
              <line
                key={`horizontal-${s.id}-${v}`}
                className="grid-line grid-line-horizontal"
                opacity={y.opacity || opacity}
                stroke={y.color === null ? s.color : y.color || color}
                strokeWidth={y.strokeWidth || strokeWidth}
                x1={0}
                x2={width}
                y1={(y.strokeWidth || strokeWidth) / 2}
                y2={(y.strokeWidth || strokeWidth) / 2}
                transform={`translate(0, ${scale(v)})`}
              />
            );
          });
        });
    } else if (y.pixels) {
      for (
        let position = (height % y.pixels) / 2;
        position <= height;
        position += y.pixels
      ) {
        lines.push(
          <line
            key={`horizontal-${position}`}
            className="grid-line grid-line-horizontal"
            x1={0}
            x2={width}
            y1={position}
            y2={position}
            stroke={y.color || color}
            strokeWidth={y.strokeWidth || strokeWidth}
            opacity={y.opacity || opacity}
          />
        );
      }
    } else if (y.count) {
      const interval = height / y.count;
      for (
        let position = interval / 2;
        position <= height;
        position += interval
      ) {
        lines.push(
          <line
            key={`horizontal-${position}`}
            className="grid-line grid-line-horizontal"
            x1={0}
            x2={width}
            y1={position}
            y2={position}
            stroke={y.color || color}
            strokeWidth={y.strokeWidth || strokeWidth}
            opacity={y.opacity || opacity}
          />
        );
      }
    }
  }

  if (x) {
    if (x.pixels) {
      for (
        let position = (width % x.pixels) / 2;
        position <= width;
        position += x.pixels
      ) {
        lines.push(
          <line
            key={`vertical-${position}`}
            className="grid-line grid-line-vertical"
            y1={0}
            y2={height}
            x1={position}
            x2={position}
            stroke={x.color || color}
            strokeWidth={x.strokeWidth || strokeWidth}
            opacity={x.opacity || opacity}
          />
        );
      }
    } else if (x.ticks !== undefined) {
      // This heavily inspired by XAxis -- maybe we can consolidate them?
      // FIXME: Remove this when we support multiple X axes
      const timeSubDomain =
        subDomainsByItemId[Object.keys(subDomainsByItemId)[0]][axes.x];
      const scale = createXScale(timeSubDomain, width);
      const values = scale.ticks(x.ticks || Math.floor(width / 100) || 1);
      values.forEach(v => {
        lines.push(
          <line
            key={`vertical-${+v}`}
            className="grid-line grid-line-vertical"
            opacity={x.opacity || opacity}
            stroke={x.color || color}
            strokeWidth={x.strokeWidth || strokeWidth}
            y1={0}
            y2={height}
            x1={(x.strokeWidth || strokeWidth) / 2}
            x2={(x.strokeWidth || strokeWidth) / 2}
            transform={`translate(${scale(v)}, 0)`}
          />
        );
      });
    } else if (x.count) {
      const interval = width / x.count;
      for (
        let position = interval / 2;
        position <= width;
        position += interval
      ) {
        lines.push(
          <line
            key={`vertical-${position}`}
            className="grid-line grid-line-vertical"
            y1={0}
            y2={height}
            x1={position}
            x2={position}
            stroke={x.color || color}
            strokeWidth={x.strokeWidth || strokeWidth}
            opacity={x.opacity || opacity}
          />
        );
      }
    }
  }

  return <g>{lines}</g>;
};

export default withDisplayName(
  'GridLines',
  ({ width, height, ...props }: Props & SizeProps) => (
    <ScalerContext.Consumer>
      {({
        series,
        subDomainsByItemId,
      }: {
        series: Series[];
        subDomainsByItemId: DomainsByItemId;
      }) => (
        <GridLines
          {...props}
          width={width}
          height={height}
          series={series}
          subDomainsByItemId={subDomainsByItemId}
        />
      )}
    </ScalerContext.Consumer>
  )
);
