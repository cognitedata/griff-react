import React from 'react';

import AXIS_DISPLAY_MODES from 'utils/AxisDisplayMode';
import {
  SingleSeriesStoryProvider,
  MultiSeriesStoryProvider,
  MultiSeriesCollectionStoryProvider,
} from '../Providers';
import LineChartDefault from '../LineChartDefault';

export default {
  title: 'Components|LineChart/Prop Stories/yAxisDisplayMode',
};

export const DisplayModeCollapsed = () => {
  return (
    <>
      <SingleSeriesStoryProvider>
        <LineChartDefault yAxisDisplayMode={AXIS_DISPLAY_MODES.COLLAPSED} />
      </SingleSeriesStoryProvider>
      <MultiSeriesStoryProvider>
        <LineChartDefault yAxisDisplayMode={AXIS_DISPLAY_MODES.COLLAPSED} />
      </MultiSeriesStoryProvider>
      <MultiSeriesCollectionStoryProvider>
        <LineChartDefault yAxisDisplayMode={AXIS_DISPLAY_MODES.COLLAPSED} />
      </MultiSeriesCollectionStoryProvider>
    </>
  );
};
DisplayModeCollapsed.story = { name: 'Y-Axis Display Mode Collapsed' };

export const DisplayModeNone = () => {
  return (
    <>
      <SingleSeriesStoryProvider>
        <LineChartDefault yAxisDisplayMode={AXIS_DISPLAY_MODES.NONE} />
      </SingleSeriesStoryProvider>
      <MultiSeriesStoryProvider>
        <LineChartDefault yAxisDisplayMode={AXIS_DISPLAY_MODES.NONE} />
      </MultiSeriesStoryProvider>
      <MultiSeriesCollectionStoryProvider>
        <LineChartDefault yAxisDisplayMode={AXIS_DISPLAY_MODES.NONE} />
      </MultiSeriesCollectionStoryProvider>
    </>
  );
};
DisplayModeNone.story = { name: 'Y-Axis Display Mode None' };
