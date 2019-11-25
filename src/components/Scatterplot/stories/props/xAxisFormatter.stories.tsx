import React from 'react';

import {
  ScatterplotSingleSeriesStoryProvider,
  ScatterplotMultiSeriesStoryProvider,
} from 'storybook/utils';
import ScatterplotDefault from '../ScatterplotDefault';

export default {
  title: 'Components|Scatterplot/Prop Stories/xAxisFormatter',
};

export const CustomXAxisFormatter = () => {
  return (
    <>
      <ScatterplotSingleSeriesStoryProvider>
        <ScatterplotDefault xAxisFormatter={v => `:) ${v.toExponential(1)}`} />
      </ScatterplotSingleSeriesStoryProvider>
      <ScatterplotMultiSeriesStoryProvider>
        <ScatterplotDefault xAxisFormatter={v => `:) ${v.toExponential(1)}`} />
      </ScatterplotMultiSeriesStoryProvider>
    </>
  );
};
CustomXAxisFormatter.story = { name: 'Custom X-Axis Tick Formatter' };
