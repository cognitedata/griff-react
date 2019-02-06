import React from 'react';
import PropTypes from 'prop-types';
import CollapsedAxis from './CollapsedAxis';
import YAxis from './YAxis';
import ScalerContext from '../../context/Scaler';
import GriffPropTypes, {
  seriesPropType,
  axisDisplayModeType,
} from '../../utils/proptypes';
import AxisDisplayMode from '../LineChart/AxisDisplayMode';
import AxisPlacement from '../AxisPlacement';

const propTypes = {
  height: PropTypes.number.isRequired,
  zoomable: PropTypes.bool,
  axisDisplayMode: axisDisplayModeType,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  yAxisPlacement: GriffPropTypes.axisPlacement,
  ticks: PropTypes.number,

  // Number => String
  tickFormatter: PropTypes.func,

  // These are populated by Griff.
  series: seriesPropType,
  collections: GriffPropTypes.collections,
  yAxisWidth: PropTypes.number,
};

const defaultProps = {
  series: [],
  collections: [],
  zoomable: true,
  ticks: 5,
  yAxisWidth: 50,
  axisDisplayMode: AxisDisplayMode.ALL,
  yAxisPlacement: AxisPlacement.RIGHT,
  onMouseEnter: null,
  onMouseLeave: null,
  tickFormatter: Number,
};

const onAxisMouseEnter = (seriesId, { onMouseEnter }) =>
  onMouseEnter ? e => onMouseEnter(e, seriesId) : null;

const onAxisMouseLeave = (seriesId, { onMouseLeave }) =>
  onMouseLeave ? e => onMouseLeave(e, seriesId) : null;

const axisFilter = mode => (s, { axisDisplayMode }) =>
  !s.hidden && (s.yAxisDisplayMode || axisDisplayMode) === mode;

const ALL_FILTER = axisFilter(AxisDisplayMode.ALL);
const COLLAPSED_FILTER = axisFilter(AxisDisplayMode.COLLAPSED);

const placementFilter = (s, { yAxisPlacement }) =>
  !s.yAxisPlacement ||
  s.yAxisPlacement === AxisPlacement.BOTH ||
  s.yAxisPlacement === yAxisPlacement;

const getAxisOffsets = ({
  axisDisplayMode,
  collections,
  series,
  yAxisPlacement,
  yAxisWidth,
}) => {
  const numCollapsed = series
    .concat(collections)
    .filter(item => COLLAPSED_FILTER(item, { axisDisplayMode })).length;
  const numVisible =
    series.reduce((count, s) => {
      if (s.collectionId === undefined && ALL_FILTER(s, { axisDisplayMode })) {
        return count + 1;
      }
      return count;
    }, 0) + collections.filter(c => ALL_FILTER(c, { axisDisplayMode })).length;

  switch (yAxisPlacement) {
    case AxisPlacement.LEFT:
      return {
        collapsed: 0,
        visible: numCollapsed ? yAxisWidth : 0,
      };
    case AxisPlacement.BOTH:
      throw new Error(
        'BOTH is not a valid option for AxisCollection -- please specify RIGHT or LEFT'
      );
    case AxisPlacement.RIGHT:
    case AxisPlacement.UNSPECIFIED:
    default:
      return {
        collapsed: numVisible * yAxisWidth,
        visible: 0,
      };
  }
};

const renderAllVisibleAxes = (
  offsetx,
  {
    axisDisplayMode,
    collections,
    height,
    onMouseEnter,
    onMouseLeave,
    series,
    tickFormatter,
    ticks,
    yAxisPlacement,
    yAxisWidth,
    zoomable,
  }
) => {
  let axisOffsetX = offsetx - yAxisWidth;

  const filteredCollections = collections
    .filter(c => ALL_FILTER(c, { axisDisplayMode }))
    .filter(c => placementFilter(c, { yAxisPlacement }));
  if (yAxisPlacement === AxisPlacement.LEFT) {
    filteredCollections.reverse();
  }

  const filteredSeries = series.filter(
    s =>
      ALL_FILTER(s, { axisDisplayMode }) &&
      placementFilter(s, { yAxisPlacement }) &&
      s.collectionId === undefined
  );
  if (yAxisPlacement === AxisPlacement.LEFT) {
    filteredSeries.reverse();
  }

  return []
    .concat(
      filteredSeries.map(s => {
        axisOffsetX += yAxisWidth;
        return (
          <YAxis
            key={`y-axis--${s.id}`}
            offsetx={axisOffsetX}
            zoomable={s.zoomable !== undefined ? s.zoomable : zoomable}
            series={s}
            height={height}
            width={yAxisWidth}
            onMouseEnter={onAxisMouseEnter(s.id, { onMouseEnter })}
            onMouseLeave={onAxisMouseLeave(s.id, { onMouseLeave })}
            tickFormatter={tickFormatter}
            yAxisPlacement={yAxisPlacement}
            ticks={ticks}
          />
        );
      })
    )
    .concat(
      filteredCollections.map(c => {
        axisOffsetX += yAxisWidth;
        return (
          <YAxis
            key={`y-axis-collection-${c.id}`}
            offsetx={axisOffsetX}
            zoomable={c.zoomable !== undefined ? c.zoomable : zoomable}
            collection={c}
            height={height}
            width={yAxisWidth}
            onMouseEnter={onAxisMouseEnter(c.id, { onMouseEnter })}
            onMouseLeave={onAxisMouseLeave(c.id, { onMouseLeave })}
            tickFormatter={tickFormatter}
            yAxisPlacement={yAxisPlacement}
            ticks={ticks}
          />
        );
      })
    );
};

const renderPlaceholderAxis = (
  offsetx,
  {
    axisDisplayMode,
    collections,
    height,
    onMouseEnter,
    onMouseLeave,
    series,
    yAxisPlacement,
    yAxisWidth,
  }
) => {
  const collapsed = series
    .filter(s => placementFilter(s, { yAxisPlacement }))
    .concat(collections)
    .filter(item => COLLAPSED_FILTER(item, { axisDisplayMode }));
  // TODO: Should we only do this if there's more than 1?
  if (collapsed.length) {
    return (
      <CollapsedAxis
        key="y-axis--collapsed"
        height={height}
        offsetx={offsetx}
        width={yAxisWidth}
        onMouseEnter={onAxisMouseEnter('collapsed', { onMouseEnter })}
        onMouseLeave={onAxisMouseLeave('collapsed', { onMouseLeave })}
        yAxisPlacement={yAxisPlacement}
      />
    );
  }
  return null;
};

const AxisCollection = ({
  axisDisplayMode,
  collections,
  height,
  onMouseEnter,
  onMouseLeave,
  series,
  tickFormatter,
  ticks,
  yAxisPlacement,
  yAxisWidth,
  zoomable,
}) => {
  const calculatedWidth = []
    .concat(series)
    .concat(collections)
    .filter(item => item.collectionId === undefined)
    .filter(item => ALL_FILTER(item, { axisDisplayMode }))
    .filter(item => placementFilter(item, { yAxisPlacement }))
    .reduce(
      (acc, item) => {
        if (item.yAxisDisplayMode === AxisDisplayMode.COLLAPSED) {
          return acc;
        }
        return acc + yAxisWidth;
      },
      series.filter(s => COLLAPSED_FILTER(s, { axisDisplayMode })).length
        ? yAxisWidth
        : 0
    );

  const {
    collapsed: collapsedOffsetX,
    visible: visibleOffsetX,
  } = getAxisOffsets({
    axisDisplayMode,
    collections,
    series,
    yAxisPlacement,
    yAxisWidth,
  });

  // We need to render all of the axes (even if they're hidden) in order to
  // keep the zoom states in sync across show/hide toggles.
  const axes = renderAllVisibleAxes(visibleOffsetX, {
    axisDisplayMode,
    collections,
    height,
    onMouseEnter,
    onMouseLeave,
    series,
    tickFormatter,
    ticks,
    yAxisPlacement,
    yAxisWidth,
    zoomable,
  });
  return (
    <svg width={calculatedWidth} height={height}>
      {axes}
      {renderPlaceholderAxis(collapsedOffsetX, {
        axisDisplayMode,
        collections,
        height,
        onMouseEnter,
        onMouseLeave,
        series,
        yAxisPlacement,
        yAxisWidth,
      })}
    </svg>
  );
};
AxisCollection.propTypes = propTypes;
AxisCollection.defaultProps = defaultProps;

export default props => (
  <ScalerContext.Consumer>
    {({ collections, series }) => (
      <AxisCollection {...props} collections={collections} series={series} />
    )}
  </ScalerContext.Consumer>
);
