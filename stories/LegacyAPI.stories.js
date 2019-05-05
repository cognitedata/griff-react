import React from 'react';
import { storiesOf } from '@storybook/react';
import { DataProvider, LineChart } from '../build/src';

import { staticLoader } from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('legacy/API', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('Series', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: '1', color: 'steelblue' }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Collections', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[
        { id: '1', color: 'steelblue', collectionId: 'grouped' },
        { id: '2', color: 'maroon', collectionId: 'grouped' },
        { id: 3, color: 'orange' },
      ]}
      collections={[{ id: 'grouped' }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ));
