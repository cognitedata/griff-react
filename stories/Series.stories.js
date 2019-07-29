import React from 'react';
import { storiesOf } from '@storybook/react';
import { LineChart, Series, Scatterplot, Griff } from '../build/src';

import { staticLoader } from './loaders';
import ToggleRenderer from './ToggleRenderer';
import { scatterplotloader } from './Scatterplot.stories';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

export const makePrintable = arr => {
  const copy = [...arr];
  copy.toString = () => `[${arr.join(', ')}]`;
  return copy;
};

/* eslint-disable react/no-multi-comp */
storiesOf('components/Series', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('Basic LineChart', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" />
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ))
  .add('Basic Scatterplot', () => (
    <Griff
      loader={scatterplotloader}
      timeDomain={[0, 1]}
      xAccessor={d => +d.x}
      yAccessor={d => +d.y}
    >
      <Series id="1 2" color="steelblue" drawPoints drawLines={false} />
      <div style={{ height: '500px', width: '100%' }}>
        <Scatterplot zoomable />
      </div>
    </Griff>
  ))
  .add('Change props', () => (
    <ToggleRenderer seriesIds={['first', 'second']} />
  ));
