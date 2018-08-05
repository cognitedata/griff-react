import React from 'react';
import 'react-select/dist/react-select.css';
import { storiesOf } from '@storybook/react';
import { AxisDisplayMode, DataProvider, LineChart } from '../src';
import { staticLoader } from './loaders';

const staticBaseDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('Series Collections', module)
  .add('Single collection', () => (
    <DataProvider
      baseDomain={staticBaseDomain}
      defaultLoader={staticLoader}
      xAccessor={d => d.timestamp}
      yAccessor={d => d.value}
      series={[
        { id: 1, collectionId: '1+2', color: 'steelblue', name: 'name1' },
        { id: 2, collectionId: '1+2', color: 'maroon', name: 'name2' },
      ]}
      collections={[{ id: '1+2', color: 'red' }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Mixed items', () => (
    <DataProvider
      baseDomain={staticBaseDomain}
      defaultLoader={staticLoader}
      xAccessor={d => d.timestamp}
      yAccessor={d => d.value}
      series={[
        { id: 1, collectionId: '1+2', color: 'steelblue', name: 'name1' },
        { id: 2, collectionId: '1+2', color: 'maroon', name: 'name2' },
        { id: 3, color: 'orange', name: 'name3' },
      ]}
      collections={[{ id: '1+2', color: 'red' }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Properties by default', () => [
    <DataProvider
      key="drawPoints"
      baseDomain={staticBaseDomain}
      defaultLoader={staticLoader}
      xAccessor={d => d.timestamp}
      yAccessor={d => d.value}
      series={[
        { id: 1, collectionId: '1+2', color: 'steelblue', name: 'name1' },
        { id: 2, collectionId: '1+2', color: 'maroon', name: 'name2' },
      ]}
      collections={[{ id: '1+2', color: 'red', drawPoints: true }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="strokeWidth"
      baseDomain={staticBaseDomain}
      defaultLoader={staticLoader}
      xAccessor={d => d.timestamp}
      yAccessor={d => d.value}
      series={[
        { id: 1, collectionId: '1+2', color: 'steelblue', name: 'name1' },
        { id: 2, collectionId: '1+2', color: 'maroon', name: 'name2' },
      ]}
      collections={[{ id: '1+2', color: 'red', strokeWidth: 3 }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="yAxisDisplayMode"
      baseDomain={staticBaseDomain}
      defaultLoader={staticLoader}
      xAccessor={d => d.timestamp}
      yAccessor={d => d.value}
      series={[
        { id: 1, collectionId: '1+2', color: 'steelblue', name: 'name1' },
        { id: 2, collectionId: '1+2', color: 'maroon', name: 'name2' },
      ]}
      collections={[
        { id: '1+2', color: 'red', yAxisDisplayMode: AxisDisplayMode.NONE },
      ]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="yDomain"
      baseDomain={staticBaseDomain}
      defaultLoader={staticLoader}
      xAccessor={d => d.timestamp}
      yAccessor={d => d.value}
      series={[
        { id: 1, collectionId: '1+2', color: 'steelblue', name: 'name1' },
        { id: 2, collectionId: '1+2', color: 'maroon', name: 'name2' },
      ]}
      collections={[{ id: '1+2', color: 'red', yDomain: [-1, 2] }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ])
  .add('Properties overridden', () => [
    <DataProvider
      key="drawPoints"
      baseDomain={staticBaseDomain}
      defaultLoader={staticLoader}
      xAccessor={d => d.timestamp}
      yAccessor={d => d.value}
      series={[
        { id: 1, collectionId: '1+2', color: 'steelblue', name: 'name1' },
        {
          id: 2,
          collectionId: '1+2',
          color: 'maroon',
          name: 'name2',
          drawPoints: false,
        },
      ]}
      collections={[{ id: '1+2', color: 'red', drawPoints: true }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="strokeWidth"
      baseDomain={staticBaseDomain}
      defaultLoader={staticLoader}
      xAccessor={d => d.timestamp}
      yAccessor={d => d.value}
      series={[
        { id: 1, collectionId: '1+2', color: 'steelblue', name: 'name1' },
        {
          id: 2,
          collectionId: '1+2',
          color: 'maroon',
          name: 'name2',
          strokeWidth: 1,
        },
      ]}
      collections={[{ id: '1+2', color: 'red', strokeWidth: 3 }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="yAxisDisplayMode"
      baseDomain={staticBaseDomain}
      defaultLoader={staticLoader}
      xAccessor={d => d.timestamp}
      yAccessor={d => d.value}
      series={[
        { id: 1, collectionId: '1+2', color: 'steelblue', name: 'name1' },
        {
          id: 2,
          collectionId: '1+2',
          color: 'maroon',
          name: 'name2',
          // This override should be ignored
          yAxisDisplayMode: AxisDisplayMode.ALL,
        },
      ]}
      collections={[
        { id: '1+2', color: 'red', yAxisDisplayMode: AxisDisplayMode.NONE },
      ]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="yAxisDisplayMode"
      baseDomain={staticBaseDomain}
      defaultLoader={staticLoader}
      xAccessor={d => d.timestamp}
      yAccessor={d => d.value}
      series={[
        { id: 1, collectionId: '1+2', color: 'steelblue', name: 'name1' },
        {
          id: 2,
          collectionId: '1+2',
          color: 'maroon',
          name: 'name2',
          yDomain: [0.5, 1],
        },
      ]}
      collections={[{ id: '1+2', color: 'red', yDomain: [0, 1] }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ]);
