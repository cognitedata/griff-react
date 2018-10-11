import React from 'react';
import PropTypes from 'prop-types';
import { createYScale } from '../../utils/scale-helpers';
import { seriesPropType, scalerFactoryFunc } from '../../utils/proptypes';
import ScalerContext from '../../context/Scaler';
import Line from '../Line';
import AxisDisplayMode from '../LineChart/AxisDisplayMode';

const LineCollection = props => {
  const { series, width, height, domain, xScalerFactory, pointWidth } = props;
  const xScale = xScalerFactory(domain, width);
  const clipPath = `clip-path-${width}-${height}-${series
    .filter(s => !s.hidden)
    .map(
      s =>
        `${s.id}-${s.collectionId || 0}-${
          (s.yAxisDisplayMode || AxisDisplayMode.ALL).id
        }`
    )
    .join('/')}`;
  const lines = series.reduce((l, s) => {
    if (s.hidden) {
      return l;
    }
    const yScale = createYScale(
      props.scaleY ? s.ySubDomain : s.yDomain,
      height
    );
    return [
      ...l,
      <Line
        key={s.id}
        {...s}
        xScale={xScale}
        yScale={yScale}
        clipPath={clipPath}
        pointWidth={s.pointWidth || pointWidth}
      />,
    ];
  }, []);
  return (
    <g width={width} height={height}>
      <clipPath id={clipPath}>
        <rect width={width} height={height} fill="none" />
      </clipPath>
      {lines}
    </g>
  );
};

LineCollection.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  series: seriesPropType,
  domain: PropTypes.arrayOf(PropTypes.number),
  xScalerFactory: scalerFactoryFunc.isRequired,
  pointWidth: PropTypes.number,
  // Perform Y-scaling based on the current subdomain. If false, then use the
  // static yDomain property.
  scaleY: PropTypes.bool,
};

LineCollection.defaultProps = {
  series: [],
  domain: [0, 0],
  pointWidth: 6,
  scaleY: true,
};

export default LineCollection;

export const ScaledLineCollection = props => (
  <ScalerContext.Consumer>
    {({ xSubDomain, series, xScalerFactory }) => (
      <LineCollection
        {...props}
        series={series}
        domain={xSubDomain}
        xScalerFactory={xScalerFactory}
      />
    )}
  </ScalerContext.Consumer>
);
