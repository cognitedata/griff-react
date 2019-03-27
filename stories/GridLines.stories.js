import React from 'react';
import 'react-select/dist/react-select.css';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { DataProvider, LineChart } from '../build/src';
import { staticLoader } from './loaders';
import GridLines from '../build/src/components/GridLines';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('Grid Lines', module)
  .add('Static horizontal lines every 35 pixels', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart onZoomXAxis={action('onZoomXAxis')} height={CHART_HEIGHT}>
        <GridLines y={{ pixels: 35 }} />
      </LineChart>
    </DataProvider>
  ))
  .add('3 static horizontal lines', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines y={{ count: 3 }} />
      </LineChart>
    </DataProvider>
  ))
  .add('Static vertical lines every 35 pixels', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ pixels: 35 }} />
      </LineChart>
    </DataProvider>
  ))
  .add('3 static vertical lines', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ count: 3 }} />
      </LineChart>
    </DataProvider>
  ))
  .add('Static grid lines every 75 pixels', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ pixels: 75 }} y={{ pixels: 75 }} />
      </LineChart>
    </DataProvider>
  ))
  .add('3 grid lines', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ count: 3 }} y={{ count: 3 }} />
      </LineChart>
    </DataProvider>
  ))
  .add('Dynamic horizontal lines', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines y={{ seriesIds: [1] }} />
      </LineChart>
    </DataProvider>
  ))
  .add('Dynamic vertical lines', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ ticks: 3 }} />
      </LineChart>
    </DataProvider>
  ))
  .add('Dynamic grid lines', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ ticks: 0 }} y={{ seriesIds: [1] }} />
      </LineChart>
    </DataProvider>
  ))
  .add('Dynamic grid lines (multiple series)', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ ticks: 0 }} y={{ seriesIds: [1, 2], color: null }} />
      </LineChart>
    </DataProvider>
  ))
  .add('color', () => [
    <DataProvider
      key="y-dimension"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines y={{ count: 5, color: 'red' }} />
      </LineChart>
    </DataProvider>,
    <DataProvider
      key="x-dimension"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ count: 5, color: 'red' }} />
      </LineChart>
    </DataProvider>,
    <DataProvider
      key="grid-object"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines color="red" x={{ count: 5 }} y={{ count: 5 }} />
      </LineChart>
    </DataProvider>,
    <DataProvider
      key="different"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines
          color="yellow"
          x={{ count: 5, color: 'orange' }}
          y={{ count: 5, color: 'green' }}
        />
      </LineChart>
    </DataProvider>,
  ])
  .add('opacity', () => [
    <DataProvider
      key="y-dimension"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines y={{ count: 5, opacity: 1 }} />
      </LineChart>
    </DataProvider>,
    <DataProvider
      key="x-dimension"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ count: 5, opacity: 1 }} />
      </LineChart>
    </DataProvider>,
    <DataProvider
      key="grid-object"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines opacity={1} x={{ count: 5 }} y={{ count: 5 }} />
      </LineChart>
    </DataProvider>,
    <DataProvider
      key="different"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines
          opacity={0}
          x={{ count: 5, opacity: 0.5 }}
          y={{ count: 5, opacity: 1 }}
        />
      </LineChart>
    </DataProvider>,
  ])
  .add('strokeWidth', () => [
    <DataProvider
      key="y-dimension"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines y={{ count: 5, strokeWidth: 5 }} />
      </LineChart>
    </DataProvider>,
    <DataProvider
      key="x-dimension"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ count: 5, strokeWidth: 5 }} />
      </LineChart>
    </DataProvider>,
    <DataProvider
      key="grid-object"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines strokeWidth={5} x={{ count: 5 }} y={{ count: 5 }} />
      </LineChart>
    </DataProvider>,
    <DataProvider
      key="different"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT}>
        <GridLines
          strokeWidth={15}
          x={{ count: 5, strokeWidth: 5 }}
          y={{ count: 5, strokeWidth: 10 }}
        />
      </LineChart>
    </DataProvider>,
  ]);
