import React from 'react';
import PropTypes from 'prop-types';
import ScalerContext from '../../context/Scaler';
import { createYScale } from '../../utils/scale-helpers';
import Points from '../Points';
import GriffPropTypes, { seriesPropType } from '../../utils/proptypes';
import Axes from '../../utils/Axes';

const propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  series: seriesPropType.isRequired,
  subDomainsByItemId: GriffPropTypes.subDomainsByItemId.isRequired,
  // (domain, width) => [number, number]
  xScalerFactory: PropTypes.func.isRequired,
};
const defaultProps = {};

const PointCollection = ({
  width,
  height,
  series,
  subDomainsByItemId,
  xScalerFactory,
}) => {
  const points = series.filter(s => !s.hidden).map(s => {
    // TODO: We can't use [s.collectionId || s.id] on the x axis. I'm not
    // entirely sure why; I think it's because the collection's x domain is not
    // correctly calculated to the data's extent. I have not looked into it
    // because it doesn't really matter yet, but it will at some point.
    const xScale = xScalerFactory(Axes.x(subDomainsByItemId[s.id]), width);
    const yScale = createYScale(
      Axes.y(subDomainsByItemId[s.collectionId || s.id]),
      height
    );
    // Only show points which are relevant for the current time subdomain.
    // We don't need to do this for lines because we want lines to be drawn to
    // infinity so that they go to the ends of the graph, but points are special
    // since they can overlap in the [x,y] plane, but not be in the current time
    // subdomain.
    const pointFilter = d => {
      const timestamp = s.timeAccessor(d);
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

PointCollection.propTypes = propTypes;
PointCollection.defaultProps = defaultProps;

export default props => (
  <ScalerContext.Consumer>
    {({ subDomainsByItemId, series, xScalerFactory }) => (
      <PointCollection
        {...props}
        series={series}
        subDomainsByItemId={subDomainsByItemId}
        xScalerFactory={xScalerFactory}
      />
    )}
  </ScalerContext.Consumer>
);
