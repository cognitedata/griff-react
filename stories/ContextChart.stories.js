import React from 'react';
import { storiesOf } from '@storybook/react';
import moment from 'moment';
import { AxisPlacement, ContextChart, DataProvider } from '../build/src';
import { staticLoader } from './loaders';

const staticXDomain = [+moment().subtract(1, 'week'), +moment()];

const exampleAnnotations = [
  {
    id: 1,
    data: [+moment().subtract(3, 'days'), +moment().subtract(2, 'days')],
    color: 'black',
  },
];

storiesOf('components/ContextChart', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('default', () => (
    <React.Fragment>
      <div style={{ width: '100%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          timeDomain={staticXDomain}
          series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
        >
          <ContextChart />
        </DataProvider>
      </div>
    </React.Fragment>
  ))
  .add('height', () => (
    <React.Fragment>
      <div style={{ width: '100%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          timeDomain={staticXDomain}
          series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
        >
          <ContextChart height={500} />
        </DataProvider>
      </div>
    </React.Fragment>
  ))
  .add('annotations', () => (
    <React.Fragment>
      <div style={{ width: '100%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          timeDomain={staticXDomain}
          series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
        >
          <ContextChart annotations={exampleAnnotations} />
        </DataProvider>
      </div>
    </React.Fragment>
  ))
  .add('zoomable', () => (
    <React.Fragment>
      <div style={{ width: '100%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          timeDomain={staticXDomain}
          series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
        >
          <ContextChart zoomable />
        </DataProvider>
      </div>
      <div style={{ width: '100%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          timeDomain={staticXDomain}
          series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
        >
          <ContextChart zoomable={false} />
        </DataProvider>
      </div>
    </React.Fragment>
  ))
  .add('xAxisFormatter', () => (
    <React.Fragment>
      <div style={{ width: '100%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          timeDomain={staticXDomain}
          series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
        >
          <ContextChart
            xAxisFormatter={date =>
              `${(
                100 *
                ((date - staticXDomain[0]) /
                  (staticXDomain[1] - staticXDomain[0]))
              ).toFixed(0)}%`
            }
          />
        </DataProvider>
      </div>
    </React.Fragment>
  ))
  .add('xAxisPlacement', () => (
    <React.Fragment>
      <div style={{ width: '100%' }}>
        <DataProvider
          defaultLoader={staticLoader}
          timeDomain={staticXDomain}
          series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
        >
          <ContextChart xAxisPlacement={AxisPlacement.TOP} />
        </DataProvider>
      </div>
    </React.Fragment>
  ));
