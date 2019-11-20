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
import { DomainsByItemId } from '../Scaler';
import { withDisplayName } from '../../utils/displayName';

const { time, x } = Axes;

export interface Props {
  width: number;
  height: number;
  xAxis: Dimension;
  series?: Series[];
  pointWidth?: number;
  scaleX?: boolean;
  yScalerFactory?: (series: Series, height: number) => ScalerFunction;
}

interface InternalProps {
  series: Series[];
  domainsByItemId: DomainsByItemId;
  subDomainsByItemId: DomainsByItemId;
}

const LineCollection: React.FunctionComponent<Props &
  InternalProps> = props => {
  const {
    domainsByItemId,
    subDomainsByItemId,
    series = new Array<Series>(),
    width,
    height,
    xAxis = time,
    yScalerFactory,
    pointWidth = 6,
    scaleX = true,
  } = props;
  if (!subDomainsByItemId) {
    return null;
  }
  const clipPath = `clip-path-${width}-${height}-${series
    .filter(s => !s.hidden)
    .map(
      s =>
        `${s.id}-${s.collectionId || 0}-${
          (s.yAxisDisplayMode || AxisDisplayMode.ALL).id
        }`
    )
    .join('/')}`;

  const yScaler =
    yScalerFactory ||
    ((s, h) =>
      createYScale(Axes.y(subDomainsByItemId[s.collectionId || s.id]), h));

  const lines = series.reduce((l, s) => {
    if (s.hidden) {
      return l;
    }
    const { id } = s;
    const xScale = createXScale(
      scaleX ? xAxis(subDomainsByItemId[id]) : xAxis(domainsByItemId[id]),
      width
    );
    const yScale = yScaler(s, height);
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
    {({ domainsByItemId, subDomainsByItemId, series }: InternalProps) => (
      <LineCollection
        series={series}
        {...props}
        domainsByItemId={domainsByItemId}
        subDomainsByItemId={subDomainsByItemId}
      />
    )}
  </ScalerContext.Consumer>
));
