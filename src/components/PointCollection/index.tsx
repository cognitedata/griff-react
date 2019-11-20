import React from 'react';
import ScalerContext from '../../context/Scaler';
import { createYScale, createXScale } from '../../utils/scale-helpers';
import Axes from '../../utils/Axes';
import { SizeProps } from '../../internal';
import { Series, Datapoint } from '../../external';
import { DomainsByItemId } from '../Scaler';
import Points from '../Points';
import { withDisplayName } from '../../utils/displayName';

export interface Props extends InternalProps, SizeProps {}

interface InternalProps {
  series: Series[];
  subDomainsByItemId: DomainsByItemId;
}

const PointCollection: React.FunctionComponent<Props> = ({
  width,
  height,
  series,
  subDomainsByItemId,
}: Props) => {
  const points = series
    .filter(s => !s.hidden && s.drawPoints !== false)
    .map(s => {
      // TODO: We can't use [s.collectionId || s.id] on the x axis. I'm not
      // entirely sure why; I think it's because the collection's x domain is not
      // correctly calculated to the data's extent. I have not looked into it
      // because it doesn't really matter yet, but it will at some point.
      const xScale = createXScale(Axes.x(subDomainsByItemId[s.id]), width);
      const yScale = createYScale(
        Axes.y(subDomainsByItemId[s.collectionId || s.id]),
        height
      );
      // Only show points which are relevant for the current time subdomain.
      // We don't need to do this for lines because we want lines to be drawn to
      // infinity so that they go to the ends of the graph, but points are special
      // since they can overlap in the [x,y] plane, but not be in the current time
      // subdomain.
      const pointFilter = (d: Datapoint, i: number, arr: Datapoint[]) => {
        const timestamp = s.timeAccessor(d, i, arr);
        const subDomain = Axes.time(subDomainsByItemId[s.id]);
        return subDomain[0] <= timestamp && timestamp <= subDomain[1];
      };
      return (
        <Points
          key={s.id}
          {...s}
          xScale={xScale}
          yScale={yScale}
          pointFilter={pointFilter}
        />
      );
    });

  return (
    <g width={width} height={height}>
      <clipPath id={`scatterplot-clip-path-${series.map(s => s.id).join('-')}`}>
        <rect width={width} height={height} fill="none" />
      </clipPath>
      {points}
    </g>
  );
};

export default withDisplayName(
  'PointCollection',
  (props: Props & SizeProps) => (
    <ScalerContext.Consumer>
      {({ subDomainsByItemId, series }: any) => (
        <PointCollection
          {...props}
          series={series}
          subDomainsByItemId={subDomainsByItemId}
        />
      )}
    </ScalerContext.Consumer>
  )
);
