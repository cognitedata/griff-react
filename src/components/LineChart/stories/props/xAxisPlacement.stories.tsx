import React from 'react';

import AXIS_PLACEMENTS from 'components/AxisPlacement';
import {
  SingleSeriesStoryProvider,
  MultiSeriesStoryProvider,
  MultiSeriesCollectionStoryProvider,
} from '../Providers';
import LineChartDefault from '../LineChartDefault';

export default {
  title: 'Components|LineChart/Prop Stories/xAxisPlacement',
};

export const XAxisPlacementTop = () => {
  return (
    <>
      <SingleSeriesStoryProvider>
        <LineChartDefault xAxisPlacement={AXIS_PLACEMENTS.TOP} />
      </SingleSeriesStoryProvider>
      <MultiSeriesStoryProvider>
        <LineChartDefault xAxisPlacement={AXIS_PLACEMENTS.TOP} />
      </MultiSeriesStoryProvider>
      <MultiSeriesCollectionStoryProvider>
        <LineChartDefault xAxisPlacement={AXIS_PLACEMENTS.TOP} />
      </MultiSeriesCollectionStoryProvider>
    </>
  );
};
XAxisPlacementTop.story = { name: 'X-Axis Placement Top' };

export const XAxisPlacementBoth = () => {
  return (
    <>
      <SingleSeriesStoryProvider>
        <LineChartDefault xAxisPlacement={AXIS_PLACEMENTS.BOTH} />
      </SingleSeriesStoryProvider>
      <MultiSeriesStoryProvider>
        <LineChartDefault xAxisPlacement={AXIS_PLACEMENTS.BOTH} />
      </MultiSeriesStoryProvider>
      <MultiSeriesCollectionStoryProvider>
        <LineChartDefault xAxisPlacement={AXIS_PLACEMENTS.BOTH} />
      </MultiSeriesCollectionStoryProvider>
    </>
  );
};
XAxisPlacementBoth.story = { name: 'X-Axis Placement Both' };
