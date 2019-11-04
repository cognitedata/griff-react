import React from 'react';
import { storiesOf } from '@storybook/react';
import { DataProvider, LineChart, Series, Scatterplot } from '../src';

import { staticLoader } from './loaders';
import ToggleRenderer from './ToggleRenderer';
import { scatterplotloader } from './Scatterplot.stories';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

/* eslint-disable react/no-multi-comp */
storiesOf('components/Series', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('Basic LineChart', () => (
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" />
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
      <Series id="1 2" color="steelblue" drawPoints />
      <div style={{ height: '500px', width: '100%' }}>
        <Scatterplot zoomable />
      </div>
    </DataProvider>
  ))
  .add('Change props', () => (
    <ToggleRenderer seriesIds={['first', 'second']} />
  ));
