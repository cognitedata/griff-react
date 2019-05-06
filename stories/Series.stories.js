import React from 'react';
import { storiesOf } from '@storybook/react';
import { DataProvider, LineChart, Series } from '../build/src';

import { staticLoader } from './loaders';
import ToggleRenderer from './ToggleRenderer';

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
  .add('Basic', () => (
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" />
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Change props', () => (
    <ToggleRenderer seriesIds={['first', 'second']} />
  ));
