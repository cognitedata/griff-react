import React from 'react';
import { DataProvider, LineChart, Series } from '../..';
import { sineLoader } from '../../../stories/utils';

const DEFAULT_HEIGHT = 800;

export default {
  title: 'Components|LineChart',
};

export const Base = () => {
  const timeDomain = [0, 10000000];
  return (
    <DataProvider defaultLoader={sineLoader} timeDomain={timeDomain}>
      <Series id="1" color="steelblue" />
      <LineChart height={DEFAULT_HEIGHT} />
    </DataProvider>
  );
};
