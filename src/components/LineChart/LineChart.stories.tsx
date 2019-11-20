import React from 'react';
import { DataProvider, LineChart, Series } from '../..';
import { sineLoader, StoryContainer } from '../../../stories/utils';

const DEFAULT_HEIGHT = 500;

export default {
  title: 'Components|LineChart',
};

export const Base = () => {
  const timeDomain = [0, 10000000];
  return (
    <StoryContainer>
      <DataProvider defaultLoader={sineLoader} timeDomain={timeDomain}>
        <Series id="1" color="steelblue" />
        <LineChart height={DEFAULT_HEIGHT} />
      </DataProvider>
    </StoryContainer>
  );
};
