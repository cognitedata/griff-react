import React from 'react';
import 'react-select/dist/react-select.css';
import { storiesOf } from '@storybook/react';
import {
  DataProvider,
  LineChart,
  AxisPlacement,
  AxisDisplayMode,
} from '../src';
import { staticLoader } from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('Y-Axis Placement', module)
  .add('Unspecified', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        { id: 1, color: 'steelblue', collectionId: '1+2' },
        { id: 2, color: 'maroon', collectionId: '1+2' },
      ]}
      collections={[{ id: '1+2', color: 'red' }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ])
  .add('Left', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.LEFT} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        { id: 1, color: 'steelblue', collectionId: '1+2' },
        { id: 2, color: 'maroon', collectionId: '1+2' },
      ]}
      collections={[{ id: '1+2', color: 'red' }]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.LEFT} />
    </DataProvider>,
  ])
  .add('Right', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        { id: 1, color: 'steelblue', collectionId: '1+2' },
        { id: 2, color: 'maroon', collectionId: '1+2' },
      ]}
      collections={[{ id: '1+2', color: 'red' }]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </DataProvider>,
  ])
  .add('Both', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.BOTH} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        { id: 1, color: 'steelblue', collectionId: '1+2' },
        { id: 2, color: 'maroon', collectionId: '1+2' },
      ]}
      collections={[{ id: '1+2', color: 'red' }]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.BOTH} />
    </DataProvider>,
  ])
  .add('Split', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        { id: 1, color: 'steelblue', yAxisPlacement: AxisPlacement.LEFT },
        { id: 2, color: 'maroon', yAxisPlacement: AxisPlacement.RIGHT },
      ]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        {
          id: 1,
          color: 'steelblue',
          collectionId: '1',
          yAxisPlacement: AxisPlacement.LEFT,
        },
        {
          id: 2,
          color: 'maroon',
          collectionId: '2',
          yAxisPlacement: AxisPlacement.RIGHT,
        },
      ]}
      collections={[
        { id: '1', color: 'red', yAxisPlacement: AxisPlacement.LEFT },
        { id: '2', color: 'blue', yAxisPlacement: AxisPlacement.RIGHT },
      ]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ])
  .add('Split, with BOTH', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        { id: 1, color: 'steelblue', yAxisPlacement: AxisPlacement.LEFT },
        { id: 2, color: 'maroon', yAxisPlacement: AxisPlacement.RIGHT },
        { id: 3, color: 'orange', yAxisPlacement: AxisPlacement.BOTH },
      ]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        {
          id: 1,
          color: 'steelblue',
          collectionId: '1',
          yAxisPlacement: AxisPlacement.LEFT,
        },
        {
          id: 2,
          color: 'maroon',
          collectionId: '2',
          yAxisPlacement: AxisPlacement.RIGHT,
        },
        {
          id: 3,
          color: 'orange',
          collectionId: '3',
          yAxisPlacement: AxisPlacement.BOTH,
        },
      ]}
      collections={[
        { id: '1', color: 'red', yAxisPlacement: AxisPlacement.LEFT },
        { id: '2', color: 'blue', yAxisPlacement: AxisPlacement.RIGHT },
        { id: '3', color: 'green', yAxisPlacement: AxisPlacement.BOTH },
      ]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ])
  .add('Split, overriding chart', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        { id: 1, color: 'steelblue', yAxisPlacement: AxisPlacement.LEFT },
        { id: 2, color: 'maroon', yAxisPlacement: AxisPlacement.RIGHT },
        { id: 3, color: 'orange', yAxisPlacement: AxisPlacement.BOTH },
      ]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.LEFT} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        {
          id: 1,
          color: 'steelblue',
          collectionId: '1',
          yAxisPlacement: AxisPlacement.LEFT,
        },
        {
          id: 2,
          color: 'maroon',
          collectionId: '2',
          yAxisPlacement: AxisPlacement.RIGHT,
        },
        {
          id: 3,
          color: 'orange',
          collectionId: '3',
          yAxisPlacement: AxisPlacement.BOTH,
        },
      ]}
      collections={[
        { id: '1', color: 'red', yAxisPlacement: AxisPlacement.LEFT },
        { id: '2', color: 'blue', yAxisPlacement: AxisPlacement.RIGHT },
        { id: '3', color: 'green', yAxisPlacement: AxisPlacement.BOTH },
      ]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.LEFT} />
    </DataProvider>,
  ])
  .add('All on the wrong side', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        { id: 1, color: 'steelblue', yAxisPlacement: AxisPlacement.LEFT },
        { id: 2, color: 'maroon', yAxisPlacement: AxisPlacement.LEFT },
      ]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        {
          id: 1,
          color: 'steelblue',
          collectionId: '1+2',
        },
        {
          id: 2,
          color: 'maroon',
          collectionId: '1+2',
        },
      ]}
      collections={[
        { id: '1+2', color: 'red', yAxisPlacement: AxisPlacement.LEFT },
      ]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </DataProvider>,
  ])
  .add('Misleading placements', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        { id: 1, color: 'steelblue', yAxisPlacement: AxisPlacement.LEFT },
        { id: 2, color: 'maroon' },
      ]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </DataProvider>,
  ])
  .add('Collapsed axis', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        {
          id: 1,
          color: 'steelblue',
          yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
        },
        { id: 2, color: 'maroon', yAxisDisplayMode: AxisDisplayMode.COLLAPSED },
      ]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.BOTH} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        {
          id: 1,
          color: 'steelblue',
          collectionId: '1+2',
        },
        {
          id: 2,
          color: 'maroon',
          collectionId: '1+2',
        },
      ]}
      collections={[
        {
          id: '1+2',
          color: 'red',
          yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
        },
      ]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.BOTH} />
    </DataProvider>,
  ])
  .add('Mixed axis modes', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        {
          id: 1,
          color: 'steelblue',
          yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
        },
        { id: 2, color: 'maroon', yAxisDisplayMode: AxisDisplayMode.COLLAPSED },
        { id: 2, color: 'orange', yAxisDisplayMode: AxisDisplayMode.ALL },
      ]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.BOTH} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[
        {
          id: 1,
          color: 'steelblue',
          yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
        },
        {
          id: 2,
          color: 'maroon',
          collectionId: '1+2',
          yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
        },
        {
          id: 2,
          color: 'orange',
          collectionId: '1+2',
          yAxisDisplayMode: AxisDisplayMode.ALL,
        },
      ]}
      collections={[{ id: '1+2', color: 'red' }]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.BOTH} />
    </DataProvider>,
  ]);
