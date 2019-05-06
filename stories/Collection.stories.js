import React from 'react';
import { storiesOf } from '@storybook/react';
import { Collection, DataProvider, LineChart, Series } from '../build/src';

import { staticLoader } from './loaders';
import ToggleRenderer from './ToggleRenderer';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

/* eslint-disable react/no-multi-comp */
storiesOf('components/Collection', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('Basic', () => (
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="collection">
        <Series id="1" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Flat structure', () => (
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="collection" />
      <Series id="1" color="steelblue" collectionId="collection" />
      <Series id="2" color="maroon" collectionId="collection" />
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Change props', () => (
    <ToggleRenderer
      collectionIds={['collection', 'alternate']}
      seriesIds={['first', 'second']}
    />
  ));
