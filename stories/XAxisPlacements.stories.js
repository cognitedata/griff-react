import React from 'react';
import { storiesOf } from '@storybook/react';
import {
  Griff,
  LineChart,
  AxisPlacement,
  Series,
  Collection,
} from '../build/src';
import { staticLoader } from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('Axes/placement/X', module)
  .add('Unspecified', () => [
    <Griff key="series" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
    <Griff key="collections" loader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="all" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
  ])
  .add('Top', () => [
    <Griff key="series" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.TOP} />
    </Griff>,
    <Griff key="collections" loader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="all" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.TOP} />
    </Griff>,
  ])
  .add('Bottom', () => [
    <Griff key="series" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.BOTTOM} />
    </Griff>,
    <Griff key="collections" loader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="all" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.BOTTOM} />
    </Griff>,
  ])
  .add('Both', () => [
    <Griff key="series" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.BOTH} />
    </Griff>,
    <Griff key="collections" loader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="all" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.BOTH} />
    </Griff>,
  ]);
