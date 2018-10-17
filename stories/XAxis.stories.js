import React from 'react';
import 'react-select/dist/react-select.css';
import { storiesOf } from '@storybook/react';
import { DataProvider, XAxis, AxisPlacement } from '../src';

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
          xDomain={[0, 1]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
        >
          <XAxis />
        </DataProvider>
      </div>
      <div style={{ width: '75%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          xDomain={[0, 1]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          xAccessor={d => +d.x}
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
          xDomain={[0, 1]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
        >
          <XAxis />
        </DataProvider>
      </div>
      <div style={{ width: '100%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          xDomain={[0, 1]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          xAccessor={d => +d.x}
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
          xDomain={[0, 1]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
        >
          <XAxis />
        </DataProvider>
      </div>
      <div style={{ width: '100%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          xDomain={[0, 1]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          xAccessor={d => +d.x}
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
          xDomain={[0, 1]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
        >
          <XAxis />
        </DataProvider>
      </div>
      <div style={{ width: '100%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          xDomain={[0, 1]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
        >
          <XAxis tickFormatter={n => Number(n).toFixed(5)} />
        </DataProvider>
      </div>
    </React.Fragment>
  ))
  .add('ticks', () => (
    <React.Fragment>
      <div style={{ width: '100%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          xDomain={[0, 1]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
        >
          <XAxis />
        </DataProvider>
      </div>
      <div style={{ width: '100%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          xDomain={[0, 1]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
        >
          <XAxis ticks={5} />
        </DataProvider>
      </div>
    </React.Fragment>
  ));
