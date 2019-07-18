import * as React from 'react';
import * as d3 from 'd3';
import { SizeMe } from 'react-sizeme';
import AxisPlacement, {
  AxisPlacement as AxisPlacementType,
} from '../AxisPlacement';
import ZoomRect from '../ZoomRect';
import { createXScale, ScalerFunctionFactory } from '../../utils/scale-helpers';
import { Domain, Series } from '../../external';
import { withDisplayName } from '../../utils/displayName';
import { Context as GriffContext } from '../Griff';

export interface Props {
  axis: 'time' | 'x';
  placement: AxisPlacementType;
  scaled: boolean;
  stroke: string;
  tickFormatter: TickFormatter;
  ticks: number;
  height: number;
  zoomable: boolean;
}

interface ScalerProps {
  series: Series[];
}

interface SizeProps {
  width: number;
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

const XAxis: React.FunctionComponent<Props & ScalerProps & SizeProps> = ({
  axis: a = 'time',
  height = 50,
  placement = AxisPlacement.BOTTOM,
  scaled = true,
  series,
  stroke = 'black',
  tickFormatter = Number,
  ticks = 0,
  width = 1,
  zoomable = true,
}) => {
  if (series.length === 0) {
    return null;
  }

  const { timeDomain, timeSubDomain, xDomain, xSubDomain } = series[0];
  const domains = {
    time: timeDomain,
    x: xDomain,
  };
  const subDomains = {
    time: timeSubDomain,
    x: xSubDomain,
  };

  // TODO: Update this to be multi-series aware. Right now this assumes one
  // single x axis, which isn't scalable.
  const domain = scaled ? subDomains[a] : domains[a];

  // The system hasn't fully booted-up yet (domains / subdomains are still being
  // calculated and populated), so we need to wait a heartbeat.
  if (!domain) {
    return null;
  }

  // @ts-ignore - I think that TypeScript is wrong here because nothing here
  // will be void .. ?
  const scale: d3.ScaleLinear<number, number> = X_SCALER_FACTORY[a](
    domain,
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
      {zoomable && (
        <ZoomRect
          width={width}
          height={height}
          itemIds={series.filter(s => !s.hidden).map(s => s.id)}
          zoomAxes={{ [a]: true }}
        />
      )}
    </svg>
  );
};

export default withDisplayName('XAxis', (props: Props) => (
  <GriffContext.Consumer>
    {({ series }: ScalerProps) => (
      <SizeMe monitorWidth>
        {({ size }: { size: SizeProps }) => (
          <XAxis series={series} {...props} width={size.width} />
        )}
      </SizeMe>
    )}
  </GriffContext.Consumer>
));
