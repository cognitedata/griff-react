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

const staticBaseDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('Y-Axis Placement', module)
  .add('Unspecified', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Left', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.LEFT} />
    </DataProvider>
  ))
  .add('Right', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </DataProvider>
  ))
  .add('Both', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.BOTH} />
    </DataProvider>
  ))
  .add('Split series', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[
        { id: 1, color: 'steelblue', yAxisPlacement: AxisPlacement.LEFT },
        { id: 2, color: 'maroon', yAxisPlacement: AxisPlacement.RIGHT },
      ]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Split series, with BOTH', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[
        { id: 1, color: 'steelblue', yAxisPlacement: AxisPlacement.LEFT },
        { id: 2, color: 'maroon', yAxisPlacement: AxisPlacement.RIGHT },
        { id: 3, color: 'orange', yAxisPlacement: AxisPlacement.BOTH },
      ]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Split series, overriding chart', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[
        { id: 1, color: 'steelblue', yAxisPlacement: AxisPlacement.LEFT },
        { id: 2, color: 'maroon', yAxisPlacement: AxisPlacement.RIGHT },
        { id: 3, color: 'orange', yAxisPlacement: AxisPlacement.BOTH },
      ]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.LEFT} />
    </DataProvider>
  ))
  .add('All on the wrong side', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
      series={[
        { id: 1, color: 'steelblue', yAxisPlacement: AxisPlacement.LEFT },
        { id: 2, color: 'maroon', yAxisPlacement: AxisPlacement.LEFT },
      ]}
    >
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </DataProvider>
  ))
  .add('Collapsed axis', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
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
    </DataProvider>
  ))
  .add('Mixed axis modes', () => (
    <DataProvider
      defaultLoader={staticLoader}
      baseDomain={staticBaseDomain}
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
    </DataProvider>
  ));
