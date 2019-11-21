import React from 'react';
import { sineLoader, StoryContainer } from 'storybook/utils';
import DataProvider from 'components/DataProvider';
import Series from 'components/Series';
import LineChart from '.';

const DEFAULT_HEIGHT = 500;

export default {
  title: 'Components|LineChart',
};

type StoryProps = {
  size?: { width: number; height: number };
};

export const Base = ({ size }: StoryProps) => {
  const timeDomain = [0, 10000000];
  return (
    <StoryContainer>
      <DataProvider defaultLoader={sineLoader} timeDomain={timeDomain}>
        <Series id="1" color="steelblue" />
        <LineChart height={DEFAULT_HEIGHT} size={size} />
      </DataProvider>
    </StoryContainer>
  );
};
