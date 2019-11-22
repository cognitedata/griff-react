import React from 'react';

import {
  SingleSeriesStoryProvider,
  MultiSeriesStoryProvider,
  MultiSeriesCollectionStoryProvider,
} from '../Providers';
import LineChartDefault from '../LineChartDefault';

export default {
  title: 'Components|LineChart/Prop Stories/yAxisTicks',
};

export const CustomYAxisTicks = () => {
  return (
    <>
      <SingleSeriesStoryProvider>
        <LineChartDefault yAxisTicks={2} />
      </SingleSeriesStoryProvider>
      <MultiSeriesStoryProvider>
        <LineChartDefault yAxisTicks={10} />
      </MultiSeriesStoryProvider>
      <MultiSeriesCollectionStoryProvider>
        <LineChartDefault yAxisTicks={4} />
      </MultiSeriesCollectionStoryProvider>
    </>
  );
};
CustomYAxisTicks.story = { name: 'Custom Y-Axis Ticks' };
