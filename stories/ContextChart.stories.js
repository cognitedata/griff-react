import React from 'react';
import { storiesOf } from '@storybook/react';
import moment from 'moment';
import { AxisPlacement, ContextChart, Griff, Series } from '../build/src';
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
    <div style={{ width: '100%' }}>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <ContextChart />
      </Griff>
    </div>
  ))
  .add('height', () => (
    <div style={{ width: '100%' }}>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <ContextChart height={500} />
      </Griff>
    </div>
  ))
  .add('annotations', () => (
    <div style={{ width: '100%' }}>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <ContextChart annotations={exampleAnnotations} />
      </Griff>
    </div>
  ))
  .add('zoomable', () => (
    <React.Fragment>
      <div style={{ width: '100%' }}>
        <Griff loader={staticLoader} timeDomain={staticXDomain}>
          <ContextChart zoomable />
        </Griff>
      </div>
      <div style={{ width: '100%' }}>
        <Griff loader={staticLoader} timeDomain={staticXDomain}>
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" />
          <ContextChart zoomable={false} />
        </Griff>
      </div>
    </React.Fragment>
  ))
  .add('xAxisFormatter', () => (
    <div style={{ width: '100%' }}>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <ContextChart
          xAxisFormatter={date =>
            `${(
              100 *
              ((date - staticXDomain[0]) /
                (staticXDomain[1] - staticXDomain[0]))
            ).toFixed(0)}%`
          }
        />
      </Griff>
    </div>
  ))
  .add('xAxisPlacement', () => (
    <div style={{ width: '100%' }}>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <ContextChart xAxisPlacement={AxisPlacement.TOP} />
      </Griff>
    </div>
  ));
