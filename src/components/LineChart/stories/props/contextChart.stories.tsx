import React from 'react';

import {
  SingleSeriesStoryProvider,
  MultiSeriesStoryProvider,
  MultiSeriesCollectionStoryProvider,
} from 'storybook/utils';
import LineChartDefault from '../LineChartDefault';

export default {
  title: 'Components|LineChart/Prop Stories/contextChart ',
};

export const ContextChartNotVisible = () => {
  return (
    <>
      <SingleSeriesStoryProvider>
        <LineChartDefault contextChart={{ visible: false, height: 50 }} />
      </SingleSeriesStoryProvider>
      <MultiSeriesStoryProvider>
        <LineChartDefault contextChart={{ visible: false, height: 0 }} />
      </MultiSeriesStoryProvider>
      <MultiSeriesCollectionStoryProvider>
        <LineChartDefault contextChart={{ visible: false, height: 0 }} />
      </MultiSeriesCollectionStoryProvider>
    </>
  );
};

export const CustomHeightContextChart = () => {
  return (
    <>
      <SingleSeriesStoryProvider>
        <LineChartDefault contextChart={{ visible: true, height: 50 }} />{' '}
      </SingleSeriesStoryProvider>
      <MultiSeriesStoryProvider>
        <LineChartDefault contextChart={{ visible: true, height: 150 }} />
      </MultiSeriesStoryProvider>
      <MultiSeriesCollectionStoryProvider>
        <LineChartDefault contextChart={{ visible: true, height: 100 }} />
      </MultiSeriesCollectionStoryProvider>
    </>
  );
};
