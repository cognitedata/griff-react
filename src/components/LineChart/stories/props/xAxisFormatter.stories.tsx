import React from 'react';

import {
  SingleSeriesStoryProvider,
  MultiSeriesStoryProvider,
  MultiSeriesCollectionStoryProvider,
} from '../Providers';
import LineChartDefault from '../LineChartDefault';

export default {
  title: 'Components|LineChart/Prop Stories/xAxisFormatter',
};

export const CustomXAxisFormatter = () => {
  return (
    <>
      <SingleSeriesStoryProvider>
        <LineChartDefault xAxisFormatter={v => `:) ${v.toExponential(1)}`} />
      </SingleSeriesStoryProvider>
      <MultiSeriesStoryProvider>
        <LineChartDefault xAxisFormatter={v => `:) ${v.toExponential(1)}`} />
      </MultiSeriesStoryProvider>
      <MultiSeriesCollectionStoryProvider>
        <LineChartDefault xAxisFormatter={v => `:) ${v.toExponential(1)}`} />
      </MultiSeriesCollectionStoryProvider>
    </>
  );
};
CustomXAxisFormatter.story = { name: 'Custom X-Axis Tick Formatter' };
