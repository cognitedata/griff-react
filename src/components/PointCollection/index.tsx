import * as React from 'react';
import * as PropTypes from 'prop-types';
import { createYScale, createXScale } from '../../utils/scale-helpers';
import { seriesPropType } from '../../utils/proptypes';
import { SizeProps } from '../../internal';
import { Series, Datapoint } from '../../external';
import Points from '../Points';
import { withDisplayName } from '../../utils/displayName';
import { Context as GriffContext } from '../Griff';

export interface Props {}

interface InternalProps {
  series: Series[];
}

const propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  series: seriesPropType.isRequired,
};
const defaultProps = {};

const PointCollection: React.FunctionComponent<
  Props & SizeProps & InternalProps
> = ({ width, height, series }) => {
  const points = series
    .filter(s => !s.hidden && s.drawPoints !== false)
    .map(s => {
      // TODO: We can't use [s.collectionId || s.id] on the x axis. I'm not
      // entirely sure why; I think it's because the collection's x domain is not
      // correctly calculated to the data's extent. I have not looked into it
      // because it doesn't really matter yet, but it will at some point.
      const xScale = createXScale(s.xSubDomain, width);
      // TODO: How will this handle collections?
      const yScale = createYScale(s.ySubDomain, height);
      // Only show points which are relevant for the current time subdomain.
      // We don't need to do this for lines because we want lines to be drawn to
      // infinity so that they go to the ends of the graph, but points are special
      // since they can overlap in the [x,y] plane, but not be in the current time
      // subdomain.
      const pointFilter = (d: Datapoint, i: number, arr: Datapoint[]) => {
        const timestamp = s.timeAccessor(d, i, arr);
        const { timeSubDomain } = s;
        return timeSubDomain[0] <= timestamp && timestamp <= timeSubDomain[1];
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

PointCollection.propTypes = propTypes;
PointCollection.defaultProps = defaultProps;

export default withDisplayName(
  'PointCollection',
  (props: Props & SizeProps) => (
    <GriffContext.Consumer>
      {({ series }: InternalProps) => (
        <PointCollection {...props} series={series} />
      )}
    </GriffContext.Consumer>
  )
);
