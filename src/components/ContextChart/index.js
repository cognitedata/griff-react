import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { SizeMe } from 'react-sizeme';
import DataContext from '../../context/Data';
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
import { withDisplayName } from '../../utils/displayName';
import { calculateDomains } from '../Scaler';
import { Context as GriffContext } from '../Griff';

const propTypes = {
  height: PropTypes.number,
  annotations: PropTypes.arrayOf(annotationPropType),
  zoomable: PropTypes.bool,
  // Number => String
  xAxisFormatter: PropTypes.func,
  xAxisHeight: PropTypes.number,
  xAxisPlacement: GriffPropTypes.axisPlacement,

  // These are all provided by Griff.
  collections: GriffPropTypes.collections.isRequired,
  unscaledSeries: GriffPropTypes.multipleSeries.isRequired,
  series: GriffPropTypes.multipleSeries.isRequired,
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

const domainToString = domain => {
  if (!domain) {
    return 'undefined';
  }
  if (!Array.isArray(domain)) {
    return 'not-an-array';
  }
  return `[${domain[0]},${domain[1]}]`;
};

const dataRange = item => {
  const { data, timeAccessor } = item;
  if (!data) {
    return 'undefined';
  }
  if (!Array.isArray(data)) {
    return 'not-an-array';
  }
  if (!timeAccessor) {
    return 'inaccessible';
  }
  if (data.length === 0) {
    return 'no-data';
  }
  return `[${timeAccessor(data[0])},${timeAccessor(data[data.length - 1])}]`;
};

// A helper function to provide checksum-ish hashes to React.useMemo so that we
// can only recompute the domains when relevant information changes.
const getDomainHashes = (...items) =>
  items.map(itemGroup =>
    itemGroup
      .map(
        item =>
          `${item.id}: { data: { ${(item.data || []).length} [${dataRange(
            item
          )}] }, collectionId: ${item.collectionId}, yDomain: ${domainToString(
            item.yDomain
          )}, ySubDomain: ${domainToString(item.ySubDomain)} }`
      )
      .join(', ')
  );

const ContextChart = ({
  annotations: propsAnnotations,
  height: propsHeight,
  unscaledSeries,
  collections,
  series,
  updateDomains,
  width,
  xAxisFormatter,
  xAxisHeight,
  xAxisPlacement,
  zoomable,
}) => {
  if (series.length === 0) {
    return null;
  }

  const reconciledDomains = useMemo(() => {
    // First things first: figure out what domain each series wants to have.
    const domainsByItemId = {};
    unscaledSeries.forEach(s => {
      const { collectionId, id } = s;

      const domain = s.yDomain || calculateDomains(s).y;

      domainsByItemId[id] = domain;

      if (collectionId) {
        const collectedDomain = domainsByItemId[collectionId] || [
          Number.MAX_SAFE_INTEGER,
          Number.MIN_SAFE_INTEGER,
        ];
        domainsByItemId[collectionId] = [
          Math.min(domain[0], collectedDomain[0]),
          Math.max(domain[1], collectedDomain[1]),
        ];
      }
    });

    // Do another pass over it to update the collected items' domains.
    unscaledSeries.forEach(s => {
      const { id, collectionId } = s;
      if (!collectionId) {
        return;
      }

      domainsByItemId[id] = domainsByItemId[collectionId];
    });

    return domainsByItemId;
  }, getDomainHashes(unscaledSeries, collections));

  const getYScale = (seriesIndex, height) => {
    const scaled = series[seriesIndex];
    const domain = reconciledDomains[scaled.id];
    return createYScale(domain, height);
  };

  const { timeDomain, timeSubDomain } = series[0];
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
  <GriffContext.Consumer>
    {({ updateDomains, series, collections }) => (
      <SizeMe monitorWidth>
        {({ size }) => (
          <ContextChart
            width={size.width}
            unscaledSeries={series}
            collections={collections}
            series={series}
            {...props}
            updateDomains={updateDomains}
          />
        )}
      </SizeMe>
    )}
  </GriffContext.Consumer>
));
