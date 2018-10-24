import React from 'react';
import PropTypes from 'prop-types';
import { createYScale } from '../../utils/scale-helpers';
import GriffPropTypes, {
  seriesPropType,
  scalerFactoryFunc,
} from '../../utils/proptypes';
import ScalerContext from '../../context/Scaler';
import Line from '../Line';
import AxisDisplayMode from '../LineChart/AxisDisplayMode';
import Axes from '../../utils/Axes';

const LineCollection = props => {
  const {
    domainsByItemId,
    subDomainsByItemId,
    series,
    width,
    height,
    xScalerFactory,
    pointWidth,
    scaleX,
    scaleY,
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
  const lines = series.reduce((l, s) => {
    if (s.hidden) {
      return l;
    }
    const { id } = s;
    const xScale = xScalerFactory(
      scaleX
        ? Axes.time(subDomainsByItemId[id])
        : Axes.time(domainsByItemId[id]),
      width
    );
    const yScale = createYScale(
      scaleY ? Axes.y(subDomainsByItemId[s.collectionId || s.id]) : s.yDomain,
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
  pointWidth: PropTypes.number,
  scaleX: PropTypes.bool,
  // Perform Y-scaling based on the current subdomain. If false, then use the
  // static yDomain property.
  scaleY: PropTypes.bool,

  // These are provided by Griff
  xScalerFactory: scalerFactoryFunc.isRequired,
  domainsByItemId: GriffPropTypes.domainsByItemId.isRequired,
  subDomainsByItemId: GriffPropTypes.subDomainsByItemId.isRequired,
};

LineCollection.defaultProps = {
  series: [],
  pointWidth: 6,
  scaleX: true,
  scaleY: true,
};

export default LineCollection;

export const ScaledLineCollection = props => (
  <ScalerContext.Consumer>
    {({ domainsByItemId, subDomainsByItemId, series, xScalerFactory }) => (
      <LineCollection
        series={series}
        {...props}
        xScalerFactory={xScalerFactory}
        domainsByItemId={domainsByItemId}
        subDomainsByItemId={subDomainsByItemId}
      />
    )}
  </ScalerContext.Consumer>
);
