import React from 'react';

import {
  SingleSeriesStoryProvider,
  MultiSeriesStoryProvider,
  MultiSeriesCollectionStoryProvider,
} from 'storybook/utils';
import LineChartDefault from '../LineChartDefault';

export default {
  title: 'Components|LineChart/Prop Stories/xAxisHeight',
};

export const CustomXAxisHeight = () => {
  return (
    <>
      <SingleSeriesStoryProvider>
        <LineChartDefault xAxisHeight={100} />
      </SingleSeriesStoryProvider>
      <MultiSeriesStoryProvider>
        <LineChartDefault xAxisHeight={35} />
      </MultiSeriesStoryProvider>
      <MultiSeriesCollectionStoryProvider>
        <LineChartDefault xAxisHeight={100} />
      </MultiSeriesCollectionStoryProvider>
    </>
  );
};
CustomXAxisHeight.story = { name: 'Custom X-Axis Height' };
