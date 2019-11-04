import React from 'react';
import { storiesOf } from '@storybook/react';
import {
  Collection,
  DataProvider,
  LineChart,
  Series,
  Scatterplot,
} from '../src';

import { staticLoader } from './loaders';
import ToggleRenderer from './ToggleRenderer';
import { scatterplotloader } from './Scatterplot.stories';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

/* eslint-disable react/no-multi-comp */
storiesOf('components/Collection', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('Basic LineChart', () => (
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="collection">
        <Series id="1" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Basic Scatterplot', () => (
    <DataProvider
      defaultLoader={scatterplotloader}
      timeDomain={[0, 1]}
      xAccessor={d => +d.x}
      yAccessor={d => +d.y}
    >
      <Collection id="collection">
        <Series id="1 2" color="steelblue" drawPoints />
        <Series id="2 3" color="maroon" drawPoints />
      </Collection>
      <div style={{ height: '500px', width: '100%' }}>
        <Scatterplot zoomable />
      </div>
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
