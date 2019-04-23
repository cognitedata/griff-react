import React from 'react';
import PropTypes from 'prop-types';
import { createXScale, createYScale } from '../../utils/scale-helpers';
import GriffPropTypes, {
  seriesPropType,
  scalerFactoryFunc,
} from '../../utils/proptypes';
import ScalerContext from '../../context/Scaler';
import Line from '../Line';
import AxisDisplayMode from '../../utils/AxisDisplayMode';
import Axes from '../../utils/Axes';

const LineCollection = props => {
  const {
    domainsByItemId,
    subDomainsByItemId,
    series,
    width,
    height,
    xAxis,
    yScalerFactory,
    pointWidth,
    scaleX,
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
  xAxis: PropTypes.oneOf(Axes.HORIZONTAL),
  series: seriesPropType,
  pointWidth: PropTypes.number,
  scaleX: PropTypes.bool,

  // These are provided by Griff
  yScalerFactory: scalerFactoryFunc,
  domainsByItemId: GriffPropTypes.domainsByItemId.isRequired,
  subDomainsByItemId: GriffPropTypes.subDomainsByItemId.isRequired,
};

LineCollection.defaultProps = {
  series: [],
  pointWidth: 6,
  scaleX: true,
  xAxis: Axes.time,
  yScalerFactory: null,
};

export default props => (
  <ScalerContext.Consumer>
    {({ domainsByItemId, subDomainsByItemId, series }) => (
      <LineCollection
        series={series}
        {...props}
        domainsByItemId={domainsByItemId}
        subDomainsByItemId={subDomainsByItemId}
      />
    )}
  </ScalerContext.Consumer>
);
