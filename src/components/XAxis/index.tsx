import React from 'react';
import * as d3 from 'd3';
import { SizeMe, SizeMeProps } from 'react-sizeme';
import AxisPlacement, {
  AxisPlacement as AxisPlacementType,
} from 'components/AxisPlacement';
import ScalerContext from 'context/Scaler';
import ZoomRect from 'components/ZoomRect';
import { createXScale, ScalerFunctionFactory } from 'utils/scale-helpers';
import { Domain, Series } from 'external';
import { DomainsByItemId } from 'components/Scaler';
import { withDisplayName } from 'utils/displayName';

export interface Props extends ScalerProps {
  axis: 'time' | 'x';
  placement: AxisPlacementType;
  scaled: boolean;
  stroke: string;
  tickFormatter: TickFormatter;
  ticks: number;
  height: number;
  width?: number;
}

interface ScalerProps {
  domainsByItemId: DomainsByItemId;
  subDomainsByItemId: DomainsByItemId;
  series: Series[];
}

export type TickFormatter = (value: number, values: number[]) => string;

const tickTransformer = (v: number) => `translate(${v}, 0)`;

/**
 * This is only used for rendering the ticks on the x-axis when it is used to
 * render time. Everywhere else in the library, {@link createXScale} should be
 * used to create scales.
 *
 * @param {number[]} domain
 * @param {number} width
 */
const createTimeScale = (
  domain: Domain,
  width: number
): d3.ScaleTime<number, number> =>
  d3
    .scaleTime()
    .domain(domain)
    .range([0, width]);

const X_SCALER_FACTORY: { [dimension: string]: ScalerFunctionFactory } = {
  time: createTimeScale,
  x: createXScale,
};

const getLineProps = ({
  tickSizeInner,
  strokeWidth,
  height,
  placement,
}: {
  tickSizeInner: number;
  strokeWidth: number;
  height: number;
  placement: AxisPlacementType;
}) => {
  switch (placement) {
    case AxisPlacement.TOP:
      return {
        x1: strokeWidth / 2,
        x2: strokeWidth / 2,
        y1: height - tickSizeInner,
        y2: height,
      };
    case AxisPlacement.BOTTOM:
    case AxisPlacement.UNSPECIFIED:
    default:
      return {
        x1: strokeWidth / 2,
        x2: strokeWidth / 2,
        y2: tickSizeInner,
      };
  }
};

const getPathString = ({
  height,
  placement,
  range,
  strokeWidth,
  tickSizeOuter,
}: {
  height: number;
  placement: AxisPlacementType;
  range: Domain;
  strokeWidth: number;
  tickSizeOuter: number;
}) => {
  switch (placement) {
    case AxisPlacement.TOP:
      return [
        `M${range[0]},${height - tickSizeOuter}`,
        `V${height - strokeWidth / 2}`,
        `H${range[1] - strokeWidth}`,
        `V${height - tickSizeOuter}`,
      ].join('');
    case AxisPlacement.BOTTOM:
    case AxisPlacement.UNSPECIFIED:
    default:
      return [
        `M${range[0]},${tickSizeOuter}`,
        `V${strokeWidth / 2}`,
        `H${range[1] - strokeWidth}`,
        `V${tickSizeOuter}`,
      ].join('');
  }
};

const getTextProps = ({
  height,
  placement,
  strokeWidth,
  tickPadding,
  tickSizeInner,
}: {
  height: number;
  placement: AxisPlacementType;
  strokeWidth: number;
  tickPadding: number;
  tickSizeInner: number;
}) => {
  switch (placement) {
    case AxisPlacement.TOP:
      return {
        y: height - (Math.max(tickSizeInner, 0) + tickPadding) - 10,
        x: strokeWidth / 2,
      };
    case AxisPlacement.BOTTOM:
    case AxisPlacement.UNSPECIFIED:
    default:
      return {
        y: Math.max(tickSizeInner, 0) + tickPadding,
        x: strokeWidth / 2,
      };
  }
};

const XAxis: React.FC<Props> = ({
  axis: a = 'time',
  domainsByItemId,
  height = 50,
  placement = AxisPlacement.BOTTOM,
  scaled = true,
  series,
  stroke = 'black',
  subDomainsByItemId,
  tickFormatter = x => Number(x).toString(),
  ticks = 0,
  width = 1,
}: Props) => {
  if (series.length === 0) {
    return null;
  }

  // TODO: Update this to be multi-series aware. Right now this assumes one
  // single x axis, which isn't scalable.
  const domain = (scaled ? subDomainsByItemId : domainsByItemId)[series[0].id];

  // The system hasn't fully booted-up yet (domains / subdomains are still being
  // calculated and populated), so we need to wait a heartbeat.
  if (!domain) {
    return null;
  }

  // @ts-ignore - I think that TypeScript is wrong here because nothing here
  // will be void .. ?
  const scale: d3.ScaleLinear<number, number> = X_SCALER_FACTORY[a](
    domain[a],
    width
  );
  const axis = d3.axisBottom(scale);
  const tickFontSize = 14;
  const strokeWidth = 2;
  const halfStrokeWidth = strokeWidth / 2;
  const tickSizeOuter = axis.tickSizeOuter();
  const tickSizeInner = axis.tickSizeInner();
  const tickPadding = axis.tickPadding();
  // In order to reduce label overlapping for smaller devices
  // we want to adjust amount of ticks depending on width.
  // Default amount of ticks is 10 which is sutable for a
  // regular 1280 display. So by dividing width by ~100
  // we can achieve appropriate amount of ticks for any width.
  const values = scale.ticks(ticks || Math.floor(width / 100) || 1);
  const range: Domain = scale.range().map(r => r + halfStrokeWidth) as Domain;
  const pathString = getPathString({
    height,
    placement,
    range,
    strokeWidth,
    tickSizeOuter,
  });

  const textProps = {
    fill: stroke,
    dy: '0.71em',
    ...getTextProps({
      height,
      placement,
      strokeWidth,
      tickPadding,
      tickSizeInner,
    }),
  };

  const axisElement = (
    <g
      data-testid="xAxis"
      className="axis x-axis"
      fill="none"
      fontSize={tickFontSize}
      textAnchor="middle"
      strokeWidth={strokeWidth}
    >
      <path stroke={stroke} d={pathString} />
      {values.map(v => {
        const lineProps = {
          stroke,
          ...getLineProps({
            height,
            placement,
            strokeWidth,
            tickSizeInner,
          }),
        };
        return (
          <g key={+v} opacity={1} transform={tickTransformer(scale(v))}>
            <line stroke={stroke} {...lineProps} />
            <text className="tick-value" {...textProps}>
              {tickFormatter(+v, values)}
            </text>
          </g>
        );
      })}
    </g>
  );

  return (
    <svg
      width={width}
      style={{ width: '100%', display: 'block' }}
      height={height}
    >
      {axisElement}
      <ZoomRect
        width={width}
        height={height}
        itemIds={series.filter(s => !s.hidden).map(s => s.id)}
        zoomAxes={{ [a]: true }}
      />
    </svg>
  );
};

export default withDisplayName('XAxis', (props: Props) => {
  const newProps = { ...props };
  if (props.width === undefined) {
    delete newProps.width;
  }
  return (
    <ScalerContext.Consumer>
      {({ domainsByItemId, subDomainsByItemId, series }: ScalerProps) => (
        <SizeMe monitorWidth>
          {({ size }: SizeMeProps) => (
            <XAxis
              series={series}
              width={size.width || undefined}
              {...newProps}
              domainsByItemId={domainsByItemId}
              subDomainsByItemId={subDomainsByItemId}
            />
          )}
        </SizeMe>
      )}
    </ScalerContext.Consumer>
  );
});
