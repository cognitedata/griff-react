import React from 'react';
import { storiesOf } from '@storybook/react';
import moment from 'moment';
import { DataProvider, LineChart, Series } from '../build/src';
import { staticLoader, liveLoader } from './loaders';
import ScalerDebugger from './ScalerDebugger';

storiesOf('components/Scaler', module)
  .add('Basic line chart', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={[+moment().subtract(2, 'weeks'), +moment()]}
    >
      <Series id="1" color="steelblue" />

      <div style={{ height: 400 }}>
        <LineChart />
      </div>

      <ScalerDebugger />
    </DataProvider>
  ))
  .add('Live loading', () => (
    <DataProvider
      defaultLoader={liveLoader}
      timeDomain={[+moment().subtract(30, 'seconds'), +moment()]}
      updateInterval={33}
    >
      <Series id="1" color="steelblue" />

      <div style={{ height: 400 }}>
        <LineChart />
      </div>

      <ScalerDebugger />
    </DataProvider>
  ))
  .add('Live loading (sticky subdomain)', () => (
    <DataProvider
      defaultLoader={liveLoader}
      timeDomain={[+moment().subtract(30, 'seconds'), +moment()]}
      updateInterval={33}
      isTimeSubDomainSticky
    >
      <Series id="1" color="steelblue" />

      <div style={{ height: 400 }}>
        <LineChart />
      </div>

      <ScalerDebugger />
    </DataProvider>
  ));
