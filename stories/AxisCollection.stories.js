import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import moment from 'moment';
import { AxisPlacement, DataProvider, AxisDisplayMode, Series } from '../src';
import { staticLoader } from './loaders';
import AxisCollection from '../src/components/AxisCollection';

const staticXDomain = [+moment().subtract(1, 'week'), +moment()];

storiesOf('components/AxisCollection', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('default', () => (
    <React.Fragment>
      <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <AxisCollection height={300} />
      </DataProvider>
    </React.Fragment>
  ))
  .add('ticks', () => (
    <React.Fragment>
      <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <AxisCollection height={300} ticks={20} />
        <AxisCollection height={300} ticks={2} />
      </DataProvider>
    </React.Fragment>
  ))
  .add('zoomable', () => (
    <React.Fragment>
      <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <AxisCollection height={300} zoomable />
        <AxisCollection height={300} zoomable={false} />
      </DataProvider>
    </React.Fragment>
  ))
  .add('axisDisplayMode', () => (
    <React.Fragment>
      <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <AxisCollection height={300} axisDisplayMode={AxisDisplayMode.ALL} />
        <AxisCollection
          height={300}
          axisDisplayMode={AxisDisplayMode.COLLAPSED}
        />
        <AxisCollection height={300} axisDisplayMode={AxisDisplayMode.NONE} />
      </DataProvider>
    </React.Fragment>
  ))
  .add('events', () => (
    <React.Fragment>
      <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <AxisCollection
          height={300}
          onMouseEnter={action('onMouseEnter')}
          onMouseLeave={action('onMouseLeave')}
        />
        <AxisCollection
          height={300}
          axisDisplayMode={AxisDisplayMode.COLLAPSED}
          onMouseEnter={action('onMouseEnter')}
          onMouseLeave={action('onMouseLeave')}
        />
      </DataProvider>
    </React.Fragment>
  ))
  .add('placement', () => (
    <React.Fragment>
      <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <AxisCollection height={300} yAxisPlacement={AxisPlacement.LEFT} />
        <AxisCollection height={300} yAxisPlacement={AxisPlacement.RIGHT} />
      </DataProvider>
    </React.Fragment>
  ))
  .add('yAxisWidth', () => (
    <React.Fragment>
      <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <AxisCollection height={300} />
        <AxisCollection height={300} yAxisWidth={100} />
      </DataProvider>
    </React.Fragment>
  ));
