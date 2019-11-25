import React from 'react';
import moment from 'moment';
import { AxisPlacement, ContextChart, DataProvider, Series } from '../src';
import { staticLoader } from './loaders';

const staticXDomain = [+moment().subtract(1, 'week'), +moment()];

const exampleAnnotations = [
  {
    id: 1,
    data: [+moment().subtract(3, 'days'), +moment().subtract(2, 'days')],
    color: 'black',
  },
];

export default {
  title: 'Demo|components/ContextChart',

  decorators: [
    story => (
      <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
        {story()}
      </div>
    ),
  ],
};

export const defaultStory = () => (
  <div style={{ width: '100%' }}>
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <ContextChart />
    </DataProvider>
  </div>
);

defaultStory.story = {
  name: 'default',
};

export const heightStory = () => (
  <div style={{ width: '100%' }}>
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <ContextChart height={500} />
    </DataProvider>
  </div>
);

heightStory.story = {
  name: 'height',
};

export const annotationsStory = () => (
  <div style={{ width: '100%' }}>
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <ContextChart annotations={exampleAnnotations} />
    </DataProvider>
  </div>
);

annotationsStory.story = {
  name: 'annotations',
};

export const zoomableStory = () => (
  <>
    <div style={{ width: '100%' }}>
      <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
        <ContextChart zoomable />
      </DataProvider>
    </div>
    <div style={{ width: '100%' }}>
      <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <ContextChart zoomable={false} />
      </DataProvider>
    </div>
  </>
);

zoomableStory.story = {
  name: 'zoomable',
};

export const xAxisFormatterStory = () => (
  <div style={{ width: '100%' }}>
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <ContextChart
        xAxisFormatter={date =>
          `${(
            100 *
            ((date - staticXDomain[0]) / (staticXDomain[1] - staticXDomain[0]))
          ).toFixed(0)}%`
        }
      />
    </DataProvider>
  </div>
);

xAxisFormatterStory.story = {
  name: 'xAxisFormatter',
};

export const xAxisPlacementStory = () => (
  <div style={{ width: '100%' }}>
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <ContextChart xAxisPlacement={AxisPlacement.TOP} />
    </DataProvider>
  </div>
);

xAxisPlacementStory.story = {
  name: 'xAxisPlacement',
};
