import React from 'react';
import 'react-select/dist/react-select.css';
import { storiesOf } from '@storybook/react';
import { DataProvider, LineChart } from '../src';
import { staticLoader } from './loaders';

const staticBaseDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('Grid Lines', module)
  .add('Static horizontal lines every 35 pixels', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT} grid={{ y: { pixels: 35 } }} />
    </DataProvider>
  ))
  .add('3 static horizontal lines', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT} grid={{ y: { count: 3 } }} />
    </DataProvider>
  ))
  .add('Static vertical lines every 35 pixels', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT} grid={{ x: { pixels: 35 } }} />
    </DataProvider>
  ))
  .add('3 static vertical lines', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT} grid={{ x: { count: 3 } }} />
    </DataProvider>
  ))
  .add('Static grid lines every 75 pixels', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        grid={{ x: { pixels: 75 }, y: { pixels: 75 } }}
      />
    </DataProvider>
  ))
  .add('3 grid lines', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        grid={{ x: { count: 3 }, y: { count: 3 } }}
      />
    </DataProvider>
  ))
  .add('Dynamic horizontal lines', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT} grid={{ y: { seriesIds: [1] } }} />
    </DataProvider>
  ))
  .add('Dynamic vertical lines', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT} grid={{ x: { ticks: 3 } }} />
    </DataProvider>
  ))
  .add('Dynamic grid lines', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        grid={{ x: { ticks: 0 }, y: { seriesIds: [1] } }}
      />
    </DataProvider>
  ))
  .add('Dynamic grid lines (multiple series)', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        grid={{ x: { ticks: 0 }, y: { seriesIds: [1, 2], color: null } }}
      />
    </DataProvider>
  ));
