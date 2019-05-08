import React from 'react';
import PropTypes from 'prop-types';
import { SizeMe } from 'react-sizeme';
import ScalerContext from '../../context/Scaler';
import LineCollection from '../LineCollection';
import XAxis from '../XAxis';
import Annotation from '../Annotation';
import GriffPropTypes, { annotationPropType } from '../../utils/proptypes';
import Brush from '../Brush';
import AxisPlacement from '../AxisPlacement';
import { multiFormat } from '../../utils/multiFormat';
import Axes from '../../utils/Axes';
import { createYScale, createXScale } from '../../utils/scale-helpers';
import { firstResolvedDomain } from '../Scaler';
import { calculateDomainFromData } from '../DataProvider';
import { withDisplayName } from '../../utils/displayName';

const propTypes = {
  height: PropTypes.number,
  annotations: PropTypes.arrayOf(annotationPropType),
  zoomable: PropTypes.bool,
  // Number => String
  xAxisFormatter: PropTypes.func,
  xAxisHeight: PropTypes.number,
  xAxisPlacement: GriffPropTypes.axisPlacement,

  // These are all provided by Griff.
  domainsByItemId: GriffPropTypes.domainsByItemId.isRequired,
  series: GriffPropTypes.multipleSeries.isRequired,
  subDomainsByItemId: GriffPropTypes.subDomainsByItemId.isRequired,
  updateDomains: GriffPropTypes.updateDomains.isRequired,
  width: PropTypes.number,
};

const defaultProps = {
  width: 1,
  height: 150,
  annotations: [],
  zoomable: true,
  xAxisFormatter: multiFormat,
  xAxisHeight: 50,
  xAxisPlacement: AxisPlacement.BOTTOM,
};

const onUpdateSelection = (
  selection,
  { series, timeDomain, updateDomains, width }
) => {
  const xScale = createXScale(timeDomain, width);
  const timeSubDomain = selection.map(xScale.invert).map(Number);
  updateDomains(
    series.reduce(
      (changes, s) => ({
        ...changes,
        [s.id]: {
          time: timeSubDomain,
        },
      }),
      {}
    )
  );
};

const getChartHeight = ({ height, xAxisHeight, xAxisPlacement }) =>
  height -
  xAxisHeight -
  (xAxisPlacement === AxisPlacement.BOTH ? xAxisHeight : 0);

const renderXAxis = (position, xAxis, { xAxisPlacement }) => {
  if (position === xAxisPlacement) {
    return xAxis;
  }
  if (xAxisPlacement === AxisPlacement.BOTH) {
    return React.cloneElement(xAxis, { placement: position });
  }
  return null;
};

const ContextChart = ({
  annotations: propsAnnotations,
  domainsByItemId,
  height: propsHeight,
  series,
  subDomainsByItemId,
  updateDomains,
  width,
  xAxisFormatter,
  xAxisHeight,
  xAxisPlacement,
  zoomable,
}) => {
  const getYScale = (s, height) => {
    const domain =
      firstResolvedDomain(
        s.yDomain,
        Axes.y(domainsByItemId[s.collectionId || s.id])
      ) ||
      calculateDomainFromData(s.data, s.yAccessor, s.y0Accessor, s.y1Accessor);
    return createYScale(domain, height);
  };

  const firstItemId = series[0].id;
  const timeDomain = Axes.time(domainsByItemId[firstItemId]);
  const timeSubDomain = Axes.time(subDomainsByItemId[firstItemId]);
  const height = getChartHeight({
    height: propsHeight,
    xAxisHeight,
    xAxisPlacement,
  });
  const xScale = createXScale(timeDomain, width);
  const selection = timeSubDomain.map(xScale);
  const annotations = propsAnnotations.map(a => (
    <Annotation key={a.id} {...a} height={height} xScale={xScale} />
  ));

  const xAxis = (
    <XAxis
      height={xAxisHeight}
      domain={timeDomain}
      tickFormatter={xAxisFormatter}
      placement={xAxisPlacement}
      scaled={false}
      axis={Axes.time}
    />
  );

  return (
    <React.Fragment>
      {renderXAxis(AxisPlacement.TOP, xAxis, { xAxisPlacement })}
      <svg
        height={height}
        width={width}
        style={{ width: '100%', display: 'block' }}
      >
        {annotations}
        <LineCollection
          series={series.map(s => ({ ...s, drawPoints: false }))}
          width={width}
          height={height}
          yScalerFactory={getYScale}
          scaleY={false}
          scaleX={false}
          subDomainsByItemId={subDomainsByItemId}
        />
        <Brush
          width={width}
          height={height}
          selection={selection}
          onUpdateSelection={newSelection =>
            onUpdateSelection(newSelection, {
              series,
              timeDomain,
              updateDomains,
              width,
            })
          }
          zoomable={zoomable}
        />
      </svg>
      {renderXAxis(AxisPlacement.BOTTOM, xAxis, { xAxisPlacement })}
    </React.Fragment>
  );
};

ContextChart.propTypes = propTypes;
ContextChart.defaultProps = defaultProps;

export default withDisplayName('ContextChart', props => (
  <ScalerContext.Consumer>
    {({ domainsByItemId, subDomainsByItemId, updateDomains, series }) => (
      <SizeMe monitorWidth>
        {({ size }) => (
          <ContextChart
            width={size.width}
            series={series}
            {...props}
            subDomainsByItemId={subDomainsByItemId}
            domainsByItemId={domainsByItemId}
            updateDomains={updateDomains}
          />
        )}
      </SizeMe>
    )}
  </ScalerContext.Consumer>
));
