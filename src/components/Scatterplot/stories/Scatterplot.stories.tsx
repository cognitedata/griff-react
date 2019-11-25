import React from 'react';

import {
  ScatterplotSingleSeriesStoryProvider,
  ScatterplotMultiSeriesStoryProvider,
} from 'storybook/utils';
import { ScatterplotProps } from '../types';
import ScatterplotDefault from './ScatterplotDefault';

export default {
  title: 'Components|Scatterplot',
};

export const Base = (scatterplotProps: Partial<ScatterplotProps>) => {
  return (
    <ScatterplotSingleSeriesStoryProvider>
      <ScatterplotDefault {...scatterplotProps} />
    </ScatterplotSingleSeriesStoryProvider>
  );
};

export const MultiSeries = (scatterplotProps: Partial<ScatterplotProps>) => {
  return (
    <ScatterplotMultiSeriesStoryProvider>
      <ScatterplotDefault {...scatterplotProps} />
    </ScatterplotMultiSeriesStoryProvider>
  );
};
