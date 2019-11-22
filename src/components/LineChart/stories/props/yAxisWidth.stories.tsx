import React from 'react';

import {
  SingleSeriesStoryProvider,
  MultiSeriesStoryProvider,
  MultiSeriesCollectionStoryProvider,
} from '../Providers';
import LineChartDefault from '../LineChartDefault';

export default {
  title: 'Components|LineChart/Prop Stories/yAxisWidth',
};

export const CustomYAxisWidth = () => {
  return (
    <>
      <SingleSeriesStoryProvider>
        <LineChartDefault yAxisWidth={100} />
      </SingleSeriesStoryProvider>
      <MultiSeriesStoryProvider>
        <LineChartDefault yAxisWidth={35} />
      </MultiSeriesStoryProvider>
      <MultiSeriesCollectionStoryProvider>
        <LineChartDefault yAxisWidth={100} />
      </MultiSeriesCollectionStoryProvider>
    </>
  );
};
CustomYAxisWidth.story = { name: 'Custom Y-Axis Width' };
