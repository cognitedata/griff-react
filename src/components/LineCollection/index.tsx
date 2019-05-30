import * as React from 'react';
import {
  createXScale,
  createYScale,
  ScalerFunction,
} from '../../utils/scale-helpers';
import ScalerContext from '../../context/Scaler';
import Line from '../Line';
import AxisDisplayMode from '../../utils/AxisDisplayMode';
import Axes, { Dimension } from '../../utils/Axes';
import { Series } from '../../external';
import { withDisplayName } from '../../utils/displayName';

const { time, x } = Axes;

export interface Props {
  width: number;
  height: number;
  xAxis: Dimension;
  series?: Series[];
  pointWidth?: number;
  scaleX?: boolean;
  yScalerFactory?: (seriesIndex: number, h: number) => ScalerFunction;
}

interface InternalProps {
  series: Series[];
}

const defaultYScaler = (series: Series[]) => (
  seriesIndex: number,
  height: number
) => createYScale(series[seriesIndex].ySubDomain, height);

const LineCollection: React.FunctionComponent<
  Props & InternalProps
> = props => {
  const {
    series = new Array<Series>(),
    width,
    height,
    xAxis = time,
    yScalerFactory,
    pointWidth = 6,
    scaleX = true,
  } = props;
  const clipPath = `clip-path-${width}-${height}-${series
    .filter(s => !s.hidden)
    .map(
      s =>
        `${s.id}-${s.collectionId || 0}-${
          (s.yAxisDisplayMode || AxisDisplayMode.ALL).id
        }`
    )
    .join('/')}`;

  const lines = series.reduce((l, s, i) => {
    if (s.hidden) {
      return l;
    }
    let domain = s.timeSubDomain;
    if (scaleX && String(xAxis) === 'time') {
      domain = s.timeSubDomain;
    } else if (scaleX && String(xAxis) === 'x') {
      domain = s.xSubDomain;
    } else if (!scaleX && String(xAxis) === 'time') {
      domain = s.timeDomain;
    } else if (!scaleX && String(xAxis) === 'x') {
      domain = s.xDomain;
    } else {
      // No idea what we're doing up here.
    }
    const xScale = createXScale(domain, width);
    const yScale = (yScalerFactory || defaultYScaler(series))(i, height);
    return [
      ...l,
      <Line
        key={s.id}
        {...s}
        xAxisAccessor={xAxis === Axes.time ? s.timeAccessor : s.xAccessor}
        xScale={xScale}
        yScale={yScale}
        clipPath={clipPath}
        pointWidth={s.pointWidth || pointWidth}
      />,
    ];
  }, new Array<React.ReactElement>());
  return (
    <g width={width} height={height}>
      <clipPath id={clipPath}>
        <rect width={width} height={height} fill="none" />
      </clipPath>
      {lines}
    </g>
  );
};

export default withDisplayName('LineCollection', (props: Props) => (
  <ScalerContext.Consumer>
    {({ series }: InternalProps) => (
      <LineCollection series={series} {...props} />
    )}
  </ScalerContext.Consumer>
));
