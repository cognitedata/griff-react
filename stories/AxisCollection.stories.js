import React from 'react';
import { action } from '@storybook/addon-actions';
import moment from 'moment';
import { AxisPlacement, DataProvider, AxisDisplayMode, Series } from '../src';
import { staticLoader } from './loaders';
import AxisCollection from '../src/components/AxisCollection';

const staticXDomain = [+moment().subtract(1, 'week'), +moment()];

export default {
  title: 'Demo|components/AxisCollection',

  decorators: [
    story => (
      <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
        {story()}
      </div>
    ),
  ],
};

export const defaultStory = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <AxisCollection height={300} />
  </DataProvider>
);

defaultStory.story = {
  name: 'default',
};

export const ticksStory = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <AxisCollection height={300} ticks={20} />
    <AxisCollection height={300} ticks={2} />
  </DataProvider>
);

ticksStory.story = {
  name: 'ticks',
};

export const zoomableStory = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <AxisCollection height={300} zoomable />
    <AxisCollection height={300} zoomable={false} />
  </DataProvider>
);

zoomableStory.story = {
  name: 'zoomable',
};

export const axisDisplayModeStory = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <AxisCollection height={300} axisDisplayMode={AxisDisplayMode.ALL} />
    <AxisCollection height={300} axisDisplayMode={AxisDisplayMode.COLLAPSED} />
    <AxisCollection height={300} axisDisplayMode={AxisDisplayMode.NONE} />
  </DataProvider>
);

axisDisplayModeStory.story = {
  name: 'axisDisplayMode',
};

export const events = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <AxisCollection
      height={300}
      onMouseEnter={action('onMouseEnter')}
      onMouseLeave={action('onMouseLeave')}
    />
    <AxisCollection
      height={300}
      axisDisplayMode={AxisDisplayMode.COLLAPSED}
      onMouseEnter={action('onMouseEnter')}
      onMouseLeave={action('onMouseLeave')}
    />
  </DataProvider>
);

events.story = {
  name: 'events',
};

export const placement = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <AxisCollection height={300} yAxisPlacement={AxisPlacement.LEFT} />
    <AxisCollection height={300} yAxisPlacement={AxisPlacement.RIGHT} />
  </DataProvider>
);

placement.story = {
  name: 'placement',
};

export const yAxisWidthStory = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <AxisCollection height={300} />
    <AxisCollection height={300} yAxisWidth={100} />
  </DataProvider>
);

yAxisWidthStory.story = {
  name: 'yAxisWidth',
};
