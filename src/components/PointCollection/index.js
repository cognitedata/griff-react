import React from 'react';
import PropTypes from 'prop-types';
import ScalerContext from '../../context/Scaler';
import { createYScale } from '../../utils/scale-helpers';
import Points from '../Points';
import { seriesPropType, domainPropType } from '../../utils/proptypes';

const propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  series: seriesPropType.isRequired,
  domain: domainPropType.isRequired,
  // (domain, width) => [number, number]
  xScalerFactory: PropTypes.func.isRequired,
};
const defaultProps = {};

const PointCollection = ({ width, height, series, domain, xScalerFactory }) => {
  const xScale = xScalerFactory(domain, width);
  const points = series.filter(s => !s.hidden).map(s => {
    const yScale = createYScale(s.ySubDomain, height);
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
    {({ subDomain, series, xScalerFactory }) => (
      <PointCollection
        {...props}
        series={series}
        domain={subDomain}
        xScalerFactory={xScalerFactory}
      />
    )}
  </ScalerContext.Consumer>
);
