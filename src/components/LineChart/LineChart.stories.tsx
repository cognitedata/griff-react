import React from 'react';
import {
  StoryContainer,
  createStaticLoader,
  createTrigValueFunc,
} from 'storybook/utils';

import Collection from 'components/Collection';
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
      <DataProvider
        defaultLoader={createStaticLoader()}
        timeDomain={timeDomain}
      >
        <Series id="Series-1" color="steelblue" />
        <LineChart height={DEFAULT_HEIGHT} size={size} />
      </DataProvider>
    </StoryContainer>
  );
};

export const MultiSeries = ({ size }: StoryProps) => {
  const timeDomain = [0, 100000000];
  return (
    <StoryContainer>
      <DataProvider timeDomain={timeDomain}>
        <Series id="Series-1" color="steelblue" loader={createStaticLoader()} />
        <Series
          id="Series-2"
          color="maroon"
          loader={createStaticLoader({
            valueFunc: createTrigValueFunc(Math.cos),
          })}
        />
        <Series
          id="Series-3"
          color="forestgreen"
          loader={createStaticLoader({
            valueFunc: createTrigValueFunc(Math.tan),
          })}
        />
        <LineChart height={DEFAULT_HEIGHT} size={size} />
      </DataProvider>
    </StoryContainer>
  );
};

export const MultiSeriesCollection = ({ size }: StoryProps) => {
  const timeDomain = [0, 1000000000];
  return (
    <StoryContainer>
      <DataProvider timeDomain={timeDomain}>
        <Collection id="Collection-1" color="darkkhaki">
          <Series id="Series-1" loader={createStaticLoader()} />
          <Series
            id="Series-2"
            loader={createStaticLoader({
              valueFunc: createTrigValueFunc(Math.cos),
            })}
          />
          <Series
            id="Series-3"
            loader={createStaticLoader({
              valueFunc: createTrigValueFunc(Math.tan),
            })}
          />
          <LineChart height={DEFAULT_HEIGHT} size={size} />
        </Collection>
      </DataProvider>
    </StoryContainer>
  );
};
