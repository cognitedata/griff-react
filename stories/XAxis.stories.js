import React from 'react';
import moment from 'moment';
import { DataProvider, XAxis, AxisPlacement, Series } from '../src';
import { staticLoader } from './loaders';

export default {
  title: 'Demo|components/XAxis',

  decorators: [
    story => (
      <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
        {story()}
      </div>
    ),
  ],
};

export const sizes = () => (
  <>
    <div style={{ width: '100%' }}>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={[+moment().subtract(1, 'week'), +moment()]}
        timeAccessor={d => +d.timestamp}
        yAccessor={d => +d.y}
      >
        <Series id="1" color="steelblue" />
        <XAxis />
      </DataProvider>
    </div>
    <div style={{ width: '50%' }}>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={[+moment().subtract(1, 'week'), +moment()]}
        timeAccessor={d => +d.timestamp}
        yAccessor={d => +d.y}
      >
        <Series id="1" color="steelblue" />
        <XAxis />
      </DataProvider>
    </div>
  </>
);

export const colorStory = () => (
  <>
    <div style={{ width: '100%' }}>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={[+moment().subtract(1, 'week'), +moment()]}
        timeAccessor={d => +d.timestamp}
        yAccessor={d => +d.y}
      >
        <Series id="1" color="steelblue" />
        <XAxis />
      </DataProvider>
    </div>
    <div style={{ width: '100%' }}>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={[+moment().subtract(1, 'week'), +moment()]}
        timeAccessor={d => +d.timestamp}
        yAccessor={d => +d.y}
      >
        <Series id="1" color="steelblue" />
        <XAxis stroke="red" />
      </DataProvider>
    </div>
  </>
);

colorStory.story = {
  name: 'color',
};

export const placementStory = () => (
  <>
    <div style={{ width: '100%' }}>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={[+moment().subtract(1, 'week'), +moment()]}
        timeAccessor={d => +d.timestamp}
        yAccessor={d => +d.y}
      >
        <Series id="1" color="steelblue" />
        <XAxis />
      </DataProvider>
    </div>
    <div style={{ width: '100%' }}>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={[+moment().subtract(1, 'week'), +moment()]}
        timeAccessor={d => +d.timestamp}
        yAccessor={d => +d.y}
      >
        <Series id="1" color="steelblue" />
        <XAxis placement={AxisPlacement.TOP} />
      </DataProvider>
    </div>
  </>
);

placementStory.story = {
  name: 'placement',
};

export const tickFormatterStory = () => (
  <>
    <div style={{ width: '100%' }}>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={[+moment().subtract(1, 'week'), +moment()]}
        timeAccessor={d => +d.timestamp}
        yAccessor={d => +d.y}
      >
        <Series id="1" color="steelblue" />
        <XAxis />
      </DataProvider>
    </div>
    <div style={{ width: '100%' }}>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={[+moment().subtract(1, 'week'), +moment()]}
        timeAccessor={d => +d.timestamp}
        yAccessor={d => +d.y}
      >
        <Series id="1" color="steelblue" />
        <XAxis tickFormatter={n => moment(n).fromNow()} />
      </DataProvider>
    </div>
  </>
);

tickFormatterStory.story = {
  name: 'tickFormatter',
};

export const ticksStory = () => (
  <>
    <div style={{ width: '100%' }}>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={[+moment().subtract(1, 'week'), +moment()]}
        timeAccessor={d => +d.timestamp}
        yAccessor={d => +d.y}
      >
        <Series id="1" color="steelblue" />
        <XAxis />
      </DataProvider>
    </div>
    <div style={{ width: '100%' }}>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={[+moment().subtract(1, 'week'), +moment()]}
        timeAccessor={d => +d.timestamp}
        yAccessor={d => +d.y}
      >
        <Series id="1" color="steelblue" />
        <XAxis ticks={20} tickFormatter={() => ''} />
      </DataProvider>
    </div>
  </>
);

ticksStory.story = {
  name: 'ticks',
};
