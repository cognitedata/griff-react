import React from 'react';
import 'react-select/dist/react-select.css';
import { storiesOf } from '@storybook/react';
import { AxisDisplayMode, DataProvider, LineChart } from '../src';
import { staticLoader } from './loaders';

const staticBaseDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('Series Collections', module)
  .add('Single collection', () => [
    <DataProvider
      key="simple"
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
    </DataProvider>,
    <DataProvider
      key="scaled"
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
          yAccessor: d => d.value + 2,
        },
      ]}
      collections={[{ id: '1+2', color: 'red' }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ])
  .add('Multiple collections', () => (
    <DataProvider
      baseDomain={staticBaseDomain}
      defaultLoader={staticLoader}
      xAccessor={d => d.timestamp}
      yAccessor={d => d.value}
      series={[
        { id: 1, collectionId: '1+2', color: 'steelblue', name: 'name1' },
        { id: 2, collectionId: '1+2', color: 'maroon', name: 'name2' },
        { id: 3, collectionId: '3+4', color: 'orange', name: 'name1' },
        { id: 4, collectionId: '3+4', color: 'green', name: 'name2' },
      ]}
      collections={[{ id: '1+2', color: 'red' }, { id: '3+4', color: 'gray' }]}
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
  .add('drawPoints', () => [
    <DataProvider
      key="default"
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
      key="override"
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
  ])
  .add('hidden', () => [
    <DataProvider
      key="default"
      baseDomain={staticBaseDomain}
      defaultLoader={staticLoader}
      xAccessor={d => d.timestamp}
      yAccessor={d => d.value}
      series={[
        { id: 1, collectionId: '1+2', color: 'steelblue', name: 'name1' },
        { id: 2, collectionId: '1+2', color: 'maroon', name: 'name2' },
      ]}
      collections={[{ id: '1+2', color: 'red', hidden: true }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="override"
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
          hidden: false,
        },
      ]}
      collections={[{ id: '1+2', color: 'red', hidden: true }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ])
  .add('strokeWidth', () => [
    <DataProvider
      key="default"
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
      key="override"
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
  ])
  .add('y0Accessor', () => {
    const y0Accessor = d => d.value - 0.5;
    const y1Accessor = d => d.value + 0.5;
    return [
      <DataProvider
        key="default"
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
          },
        ]}
        collections={[{ id: '1+2', color: 'red', y0Accessor, y1Accessor }]}
      >
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>,
      <DataProvider
        key="override"
        baseDomain={staticBaseDomain}
        defaultLoader={staticLoader}
        xAccessor={d => d.timestamp}
        yAccessor={d => d.value}
        series={[
          { id: 3, collectionId: '3+4', color: 'steelblue', name: 'name1' },
          {
            id: 4,
            collectionId: '3+4',
            color: 'maroon',
            name: 'name2',
            y0Accessor: null,
            y1Accessor: null,
          },
        ]}
        collections={[{ id: '3+4', color: 'red', y0Accessor, y1Accessor }]}
      >
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>,
    ];
  })
  .add('yAxisDisplayMode', () => [
    <DataProvider
      key="default"
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
      key="override"
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
          yAxisDisplayMode: AxisDisplayMode.ALL,
        },
      ]}
      collections={[
        { id: '1+2', color: 'red', yAxisDisplayMode: AxisDisplayMode.NONE },
      ]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ])
  .add('yDomain', () => [
    // The yDomain is provided on the collection; the axis should have this
    // yDomain.
    <DataProvider
      key="default"
      baseDomain={staticBaseDomain}
      defaultLoader={staticLoader}
      xAccessor={d => d.timestamp}
      yAccessor={d => d.value}
      series={[
        { id: 1, collectionId: '1+2', color: 'steelblue', name: 'name1' },
        { id: 2, collectionId: '1+2', color: 'maroon', name: 'name2' },
      ]}
      collections={[{ id: '1+2', color: 'red', yDomain: [-4, 4] }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    // The yDomain is also provided on one series -- this override should be
    // ignored because it is ignored when in a collection.
    <DataProvider
      key="override"
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
      collections={[{ id: '1+2', color: 'red', yDomain: [-5, 5] }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    // The two series are offset so that the context chart behavior can be
    // verified. The context chart should use the same initial (unscaled)
    // yDomain as the collection.
    <DataProvider
      key="scaled"
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
          yAccessor: d => d.value + 2,
        },
      ]}
      collections={[{ id: '1+2', color: 'red', yDomain: [-6, 6] }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ]);
