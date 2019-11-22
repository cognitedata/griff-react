import React from 'react';

import {
  SingleSeriesStoryProvider,
  MultiSeriesStoryProvider,
  MultiSeriesCollectionStoryProvider,
} from '../Providers';
import LineChartDefault from '../LineChartDefault';

export default {
  title: 'Components|LineChart/Prop Stories/yAxisFormatter',
};

export const CustomYAxisFormatter = () => {
  return (
    <>
      <SingleSeriesStoryProvider>
        <LineChartDefault yAxisFormatter={v => `:) ${v + 1}`} />
      </SingleSeriesStoryProvider>
      <MultiSeriesStoryProvider>
        <LineChartDefault yAxisFormatter={v => `:) ${v + 1}`} />
      </MultiSeriesStoryProvider>
      <MultiSeriesCollectionStoryProvider>
        <LineChartDefault yAxisFormatter={v => `:) ${v + 1}`} />
      </MultiSeriesCollectionStoryProvider>
    </>
  );
};
CustomYAxisFormatter.story = { name: 'Custom Y-Axis Tick Formatter' };
