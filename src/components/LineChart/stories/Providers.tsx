import React from 'react';
import {
  StoryContainer,
  createStaticLoader,
  createTrigValueFunc,
} from 'storybook/utils';

import DataProvider from 'components/DataProvider';
import Collection from 'components/Collection';
import Series from 'components/Series';

type Props = {
  children: React.ReactNode;
};

export const SingleSeriesStoryProvider: React.FC<Props> = ({
  children,
}: Props) => {
  const timeDomain = [0, 10000000];
  return (
    <StoryContainer>
      <DataProvider
        defaultLoader={createStaticLoader()}
        timeDomain={timeDomain}
      >
        <Series id="Series-1" color="steelblue" />
        {children}
      </DataProvider>
    </StoryContainer>
  );
};

export const MultiSeriesStoryProvider: React.FC<Props> = ({
  children,
}: Props) => {
  const timeDomain = [0, 10000000];
  return (
    <StoryContainer>
      <DataProvider
        defaultLoader={createStaticLoader()}
        timeDomain={timeDomain}
      >
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
        {children}
      </DataProvider>
    </StoryContainer>
  );
};

export const MultiSeriesCollectionStoryProvider: React.FC<Props> = ({
  children,
}: Props) => {
  const timeDomain = [0, 10000000];
  return (
    <StoryContainer>
      <DataProvider
        defaultLoader={createStaticLoader()}
        timeDomain={timeDomain}
      >
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
        </Collection>
        {children}
      </DataProvider>
    </StoryContainer>
  );
};
