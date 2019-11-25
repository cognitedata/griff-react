import React from 'react';

import {
  SingleSeriesStoryProvider,
  MultiSeriesStoryProvider,
  MultiSeriesCollectionStoryProvider,
} from 'storybook/utils';
import LineChartDefault from '../LineChartDefault';
import { Area } from '../../types';

export default {
  title: 'Components|LineChart/Prop Stories/areas ',
};

const mockArea1: Area = {
  id: '1',
  color: 'steelblue',
  start: { yval: 0.75, xval: 2000000 },
  end: { yval: 0.15, xval: 9000000 },
  seriesId: 'Series-1',
};

const mockArea2: Area = {
  id: '2',
  color: 'maroon',
  start: { yval: 0.1, xval: 5000000 },
  end: { yval: 0.5, xval: 10000000 },
  seriesId: 'Series-2',
};

export const CustomAreas = () => {
  return (
    <>
      <SingleSeriesStoryProvider>
        <LineChartDefault areas={[mockArea1]} />
      </SingleSeriesStoryProvider>
      <MultiSeriesStoryProvider>
        <LineChartDefault areas={[mockArea1, mockArea2]} />
      </MultiSeriesStoryProvider>
      <MultiSeriesCollectionStoryProvider>
        <LineChartDefault areas={[mockArea1, mockArea2]} />
      </MultiSeriesCollectionStoryProvider>
    </>
  );
};
