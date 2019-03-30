import React from 'react';
import { storiesOf } from '@storybook/react';
import moment from 'moment';
import { DataProvider, XAxis, AxisPlacement } from '../build/src';
import { staticLoader } from './loaders';

storiesOf('XAxis', module)
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
          series={[{ id: '1 2', color: 'steelblue' }]}
          timeAccessor={d => +d.timestamp}
          yAccessor={d => +d.y}
        >
          <XAxis />
        </DataProvider>
      </div>
      <div style={{ width: '50%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          timeDomain={[+moment().subtract(1, 'week'), +moment()]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          timeAccessor={d => +d.timestamp}
          yAccessor={d => +d.y}
        >
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
          series={[{ id: '1 2', color: 'steelblue' }]}
          timeAccessor={d => +d.timestamp}
          yAccessor={d => +d.y}
        >
          <XAxis />
        </DataProvider>
      </div>
      <div style={{ width: '100%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          timeDomain={[+moment().subtract(1, 'week'), +moment()]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          timeAccessor={d => +d.timestamp}
          yAccessor={d => +d.y}
        >
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
          series={[{ id: '1 2', color: 'steelblue' }]}
          timeAccessor={d => +d.timestamp}
          yAccessor={d => +d.y}
        >
          <XAxis />
        </DataProvider>
      </div>
      <div style={{ width: '100%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          timeDomain={[+moment().subtract(1, 'week'), +moment()]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          timeAccessor={d => +d.timestamp}
          yAccessor={d => +d.y}
        >
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
          series={[{ id: '1 2', color: 'steelblue' }]}
          timeAccessor={d => +d.timestamp}
          yAccessor={d => +d.y}
        >
          <XAxis />
        </DataProvider>
      </div>
      <div style={{ width: '100%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          timeDomain={[+moment().subtract(1, 'week'), +moment()]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          timeAccessor={d => +d.timestamp}
          yAccessor={d => +d.y}
        >
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
          series={[{ id: '1 2', color: 'steelblue' }]}
          timeAccessor={d => +d.timestamp}
          yAccessor={d => +d.y}
        >
          <XAxis />
        </DataProvider>
      </div>
      <div style={{ width: '100%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          timeDomain={[+moment().subtract(1, 'week'), +moment()]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          timeAccessor={d => +d.timestamp}
          yAccessor={d => +d.y}
        >
          <XAxis ticks={2} />
        </DataProvider>
      </div>
    </React.Fragment>
  ));
