import React from 'react';
import 'react-select/dist/react-select.css';
import { storiesOf } from '@storybook/react';
import { DataProvider, LineChart, AxisPlacement } from '../src';
import { staticLoader } from './loaders';

const staticBaseDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('X-Axis Placement', module)
  .add('Unspecified', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[
        { id: 1, color: 'steelblue', collectionId: '1+2' },
        { id: 2, color: 'maroon', collectionId: '1+2' },
      ]}
      collections={[{ id: '1+2', color: 'red' }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ])
  .add('Top', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.TOP} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[
        { id: 1, color: 'steelblue', collectionId: '1+2' },
        { id: 2, color: 'maroon', collectionId: '1+2' },
      ]}
      collections={[{ id: '1+2', color: 'red' }]}
    >
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.TOP} />
    </DataProvider>,
  ])
  .add('Bottom', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.BOTTOM} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[
        { id: 1, color: 'steelblue', collectionId: '1+2' },
        { id: 2, color: 'maroon', collectionId: '1+2' },
      ]}
      collections={[{ id: '1+2', color: 'red' }]}
    >
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.BOTTOM} />
    </DataProvider>,
  ])
  .add('Both', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.BOTH} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[
        { id: 1, color: 'steelblue', collectionId: '1+2' },
        { id: 2, color: 'maroon', collectionId: '1+2' },
      ]}
      collections={[{ id: '1+2', color: 'red' }]}
    >
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.BOTH} />
    </DataProvider>,
  ]);
