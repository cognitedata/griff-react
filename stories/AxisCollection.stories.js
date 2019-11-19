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
  <React.Fragment>
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <AxisCollection height={300} />
    </DataProvider>
  </React.Fragment>
);

defaultStory.story = {
  name: 'default',
};

export const ticksStory = () => (
  <React.Fragment>
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <AxisCollection height={300} ticks={20} />
      <AxisCollection height={300} ticks={2} />
    </DataProvider>
  </React.Fragment>
);

ticksStory.story = {
  name: 'ticks',
};

export const zoomableStory = () => (
  <React.Fragment>
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <AxisCollection height={300} zoomable />
      <AxisCollection height={300} zoomable={false} />
    </DataProvider>
  </React.Fragment>
);

zoomableStory.story = {
  name: 'zoomable',
};

export const axisDisplayModeStory = () => (
  <React.Fragment>
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <AxisCollection height={300} axisDisplayMode={AxisDisplayMode.ALL} />
      <AxisCollection
        height={300}
        axisDisplayMode={AxisDisplayMode.COLLAPSED}
      />
      <AxisCollection height={300} axisDisplayMode={AxisDisplayMode.NONE} />
    </DataProvider>
  </React.Fragment>
);

axisDisplayModeStory.story = {
  name: 'axisDisplayMode',
};

export const events = () => (
  <React.Fragment>
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
  </React.Fragment>
);

events.story = {
  name: 'events',
};

export const placement = () => (
  <React.Fragment>
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <AxisCollection height={300} yAxisPlacement={AxisPlacement.LEFT} />
      <AxisCollection height={300} yAxisPlacement={AxisPlacement.RIGHT} />
    </DataProvider>
  </React.Fragment>
);

placement.story = {
  name: 'placement',
};

export const yAxisWidthStory = () => (
  <React.Fragment>
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <AxisCollection height={300} />
      <AxisCollection height={300} yAxisWidth={100} />
    </DataProvider>
  </React.Fragment>
);

yAxisWidthStory.story = {
  name: 'yAxisWidth',
};
