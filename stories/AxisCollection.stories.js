import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import moment from 'moment';
import { AxisPlacement, Griff, AxisDisplayMode, Series } from '../build/src';
import { staticLoader } from './loaders';
import AxisCollection from '../build/src/components/AxisCollection';

const staticXDomain = [+moment().subtract(1, 'week'), +moment()];

storiesOf('components/AxisCollection', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('default', () => (
    <React.Fragment>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <AxisCollection height={300} />
      </Griff>
    </React.Fragment>
  ))
  .add('ticks', () => (
    <React.Fragment>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <AxisCollection height={300} ticks={20} />
        <AxisCollection height={300} ticks={2} />
      </Griff>
    </React.Fragment>
  ))
  .add('zoomable', () => (
    <React.Fragment>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <AxisCollection height={300} zoomable />
        <AxisCollection height={300} zoomable={false} />
      </Griff>
    </React.Fragment>
  ))
  .add('axisDisplayMode', () => (
    <React.Fragment>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <AxisCollection height={300} axisDisplayMode={AxisDisplayMode.ALL} />
        <AxisCollection
          height={300}
          axisDisplayMode={AxisDisplayMode.COLLAPSED}
        />
        <AxisCollection height={300} axisDisplayMode={AxisDisplayMode.NONE} />
      </Griff>
    </React.Fragment>
  ))
  .add('events', () => (
    <React.Fragment>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
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
      </Griff>
    </React.Fragment>
  ))
  .add('placement', () => (
    <React.Fragment>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <AxisCollection height={300} yAxisPlacement={AxisPlacement.LEFT} />
        <AxisCollection height={300} yAxisPlacement={AxisPlacement.RIGHT} />
      </Griff>
    </React.Fragment>
  ))
  .add('yAxisWidth', () => (
    <React.Fragment>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <AxisCollection height={300} />
        <AxisCollection height={300} yAxisWidth={100} />
      </Griff>
    </React.Fragment>
  ));
