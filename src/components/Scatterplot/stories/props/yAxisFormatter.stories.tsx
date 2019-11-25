import React from 'react';

import {
  ScatterplotSingleSeriesStoryProvider,
  ScatterplotMultiSeriesStoryProvider,
} from 'storybook/utils';
import ScatterplotDefault from '../ScatterplotDefault';

export default {
  title: 'Components|Scatterplot/Prop Stories/yAxisFormatter',
};

export const CustomYAxisFormatter = () => {
  return (
    <>
      <ScatterplotSingleSeriesStoryProvider>
        <ScatterplotDefault yAxisFormatter={v => `:) ${(v + 1).toFixed(1)}`} />
      </ScatterplotSingleSeriesStoryProvider>
      <ScatterplotMultiSeriesStoryProvider>
        <ScatterplotDefault yAxisFormatter={v => `:) ${(v + 1).toFixed(1)}`} />
      </ScatterplotMultiSeriesStoryProvider>
    </>
  );
};
CustomYAxisFormatter.story = { name: 'Custom Y-Axis Tick Formatter' };
