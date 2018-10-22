import React from 'react';
import PropTypes from 'prop-types';
import ScalerContext from '../../context/Scaler';
import { createYScale } from '../../utils/scale-helpers';
import Points from '../Points';
import GriffPropTypes, { seriesPropType } from '../../utils/proptypes';

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
    const xScale = xScalerFactory(subDomainsByItemId[s.id].x, width);
    const yScale = createYScale(subDomainsByItemId[s.id].y, height);
    return <Points key={s.id} {...s} xScale={xScale} yScale={yScale} />;
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

export default PointCollection;

export const ScaledPointCollection = props => (
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
