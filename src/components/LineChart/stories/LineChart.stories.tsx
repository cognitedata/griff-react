import React from 'react';

import {
  SingleSeriesStoryProvider,
  MultiSeriesStoryProvider,
  MultiSeriesCollectionStoryProvider,
} from 'storybook/utils';
import LineChartDefault from './LineChartDefault';
import { LineChartProps } from '../types';

export default {
  title: 'Components|LineChart',
};

export const Base = (lineChartProps: Partial<LineChartProps>) => {
  return (
    <SingleSeriesStoryProvider>
      <LineChartDefault {...lineChartProps} />
    </SingleSeriesStoryProvider>
  );
};

export const MultiSeries = (lineChartProps: Partial<LineChartProps>) => {
  return (
    <MultiSeriesStoryProvider>
      <LineChartDefault {...lineChartProps} />
    </MultiSeriesStoryProvider>
  );
};

export const MultiSeriesCollection = (
  lineChartProps: Partial<LineChartProps>
) => {
  return (
    <MultiSeriesCollectionStoryProvider>
      <LineChartDefault {...lineChartProps} />
    </MultiSeriesCollectionStoryProvider>
  );
};
