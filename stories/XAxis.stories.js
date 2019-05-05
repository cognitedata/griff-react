import React from 'react';
import { storiesOf } from '@storybook/react';
import moment from 'moment';
import { DataProvider, XAxis, AxisPlacement, Series } from '../build/src';
import { staticLoader } from './loaders';

storiesOf('components/XAxis', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('Sizes', () => (
    <React.Fragment>
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
    </React.Fragment>
  ))
  .add('color', () => (
    <React.Fragment>
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
    </React.Fragment>
  ))
  .add('placement', () => (
    <React.Fragment>
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
    </React.Fragment>
  ))
  .add('tickFormatter', () => (
    <React.Fragment>
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
    </React.Fragment>
  ))
  .add('ticks', () => (
    <React.Fragment>
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
    </React.Fragment>
  ));
