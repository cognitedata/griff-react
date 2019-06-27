import React from 'react';
import moment from 'moment';
import { storiesOf } from '@storybook/react';
import { Griff, LineChart, Series } from '../build/src';

import { staticLoader } from './loaders';
import GriffDebugger from './GriffDebugger';

const CHART_HEIGHT = 500;
const timeDomain = [+moment().subtract(24, 'days'), +moment()];

storiesOf('Griff', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('Empty', () => (
    <Griff loader={staticLoader} timeDomain={timeDomain}>
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ))
  .add('Basic', () => (
    <Griff loader={staticLoader} timeDomain={timeDomain}>
      <Series id="1" color="steelblue" />
      <LineChart height={CHART_HEIGHT} />
      <GriffDebugger />
    </Griff>
  ));
