import React from 'react';
import 'react-select/dist/react-select.css';
import { storiesOf } from '@storybook/react';
import { DataProvider, LineChart } from '../src';
import { staticLoader } from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('Grid Lines', module)
  .add('Static horizontal lines every 35 pixels', () => (
    <DataProvider
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        grid={{ y: { pixels: 35 } }}
        onZoomXAxis={t => console.log(t)}
      />
    </DataProvider>
  ))
  .add('3 static horizontal lines', () => (
    <DataProvider
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT} grid={{ y: { count: 3 } }} />
    </DataProvider>
  ))
  .add('Static vertical lines every 35 pixels', () => (
    <DataProvider
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT} grid={{ x: { pixels: 35 } }} />
    </DataProvider>
  ))
  .add('3 static vertical lines', () => (
    <DataProvider
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT} grid={{ x: { count: 3 } }} />
    </DataProvider>
  ))
  .add('Static grid lines every 75 pixels', () => (
    <DataProvider
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
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
      xDomain={staticXDomain}
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
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT} grid={{ y: { seriesIds: [1] } }} />
    </DataProvider>
  ))
  .add('Dynamic vertical lines', () => (
    <DataProvider
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT} grid={{ x: { ticks: 3 } }} />
    </DataProvider>
  ))
  .add('Dynamic grid lines', () => (
    <DataProvider
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
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
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        grid={{ x: { ticks: 0 }, y: { seriesIds: [1, 2], color: null } }}
      />
    </DataProvider>
  ))
  .add('color', () => [
    <DataProvider
      key="y-dimension"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        grid={{ y: { count: 5, color: 'red' } }}
      />
    </DataProvider>,
    <DataProvider
      key="x-dimension"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        grid={{ x: { count: 5, color: 'red' } }}
      />
    </DataProvider>,
    <DataProvider
      key="grid-object"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        grid={{ color: 'red', x: { count: 5 }, y: { count: 5 } }}
      />
    </DataProvider>,
    <DataProvider
      key="different"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        grid={{
          color: 'yellow',
          x: { count: 5, color: 'orange' },
          y: { count: 5, color: 'green' },
        }}
      />
    </DataProvider>,
  ])
  .add('opacity', () => [
    <DataProvider
      key="y-dimension"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT} grid={{ y: { count: 5, opacity: 1 } }} />
    </DataProvider>,
    <DataProvider
      key="x-dimension"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT} grid={{ x: { count: 5, opacity: 1 } }} />
    </DataProvider>,
    <DataProvider
      key="grid-object"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        grid={{ opacity: 1, x: { count: 5 }, y: { count: 5 } }}
      />
    </DataProvider>,
    <DataProvider
      key="different"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        grid={{
          opacity: 0,
          x: { count: 5, opacity: 0.5 },
          y: { count: 5, opacity: 1 },
        }}
      />
    </DataProvider>,
  ])
  .add('strokeWidth', () => [
    <DataProvider
      key="y-dimension"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        grid={{ y: { count: 5, strokeWidth: 5 } }}
      />
    </DataProvider>,
    <DataProvider
      key="x-dimension"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        grid={{ x: { count: 5, strokeWidth: 5 } }}
      />
    </DataProvider>,
    <DataProvider
      key="grid-object"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        grid={{ strokeWidth: 5, x: { count: 5 }, y: { count: 5 } }}
      />
    </DataProvider>,
    <DataProvider
      key="different"
      defaultLoader={staticLoader}
      xDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        grid={{
          strokeWidth: 15,
          x: { count: 5, strokeWidth: 5 },
          y: { count: 5, strokeWidth: 10 },
        }}
      />
    </DataProvider>,
  ]);
