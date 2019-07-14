import React from 'react';
import { storiesOf } from '@storybook/react';
import {
  Griff,
  LineChart,
  AxisPlacement,
  AxisDisplayMode,
  Series,
  Collection,
} from '../build/src';
import { staticLoader } from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('Axes/placement/Y', module)
  .add('Unspecified', () => [
    <Griff key="series" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
    <Griff key="collections" loader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
  ])
  .add('Left', () => [
    <Griff key="series" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.LEFT} />
    </Griff>,
    <Griff key="collections" loader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.LEFT} />
    </Griff>,
  ])
  .add('Right', () => [
    <Griff key="series" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </Griff>,
    <Griff key="collections" loader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </Griff>,
  ])
  .add('Both', () => [
    <Griff key="series" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.BOTH} />
    </Griff>,
    <Griff key="collections" loader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.BOTH} />
    </Griff>,
  ])
  .add('Split', () => [
    <Griff key="series" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      <Series id="2" color="maroon" yAxisPlacement={AxisPlacement.RIGHT} />
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
    <Griff key="collections" loader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="1" color="red" yAxisPlacement={AxisPlacement.LEFT}>
        <Series id="1" color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      </Collection>
      <Collection id="2" color="blue" yAxisPlacement={AxisPlacement.RIGHT}>
        <Series id="2" color="maroon" yAxisPlacement={AxisPlacement.RIGHT} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
  ])
  .add('Split, with BOTH', () => [
    <Griff key="series" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id={1} color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      <Series id={2} color="maroon" yAxisPlacement={AxisPlacement.RIGHT} />
      <Series id={3} color="orange" yAxisPlacement={AxisPlacement.BOTH} />
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
    <Griff key="collections" loader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="1" color="red" yAxisPlacement={AxisPlacement.LEFT}>
        <Series id="1" color="steelblue" />
      </Collection>
      <Collection id="2" color="blue" yAxisPlacement={AxisPlacement.RIGHT}>
        <Series id="2" color="maroon" />
      </Collection>
      <Collection id="3" color="green" yAxisPlacement={AxisPlacement.BOTH}>
        <Series id="3" color="orange" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
  ])
  .add('Split, overriding chart', () => [
    <Griff key="series" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id={1} color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      <Series id={2} color="maroon" yAxisPlacement={AxisPlacement.RIGHT} />
      <Series id={3} color="orange" yAxisPlacement={AxisPlacement.BOTH} />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.LEFT} />
    </Griff>,
    <Griff key="collections" loader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="1" color="red" yAxisPlacement={AxisPlacement.LEFT}>
        <Series id="1" color="steelblue" />
      </Collection>
      <Collection id="2" color="blue" yAxisPlacement={AxisPlacement.RIGHT}>
        <Series id="2" color="maroon" />
      </Collection>
      <Collection id="3" color="green" yAxisPlacement={AxisPlacement.BOTH}>
        <Series id="3" color="orange" />
      </Collection>
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.LEFT} />
    </Griff>,
  ])
  .add('All on the wrong side', () => [
    <Griff key="series" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      <Series id="2" color="maroon" yAxisPlacement={AxisPlacement.LEFT} />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </Griff>,
    <Griff key="collections" loader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="1+2" color="red" yAxisPlacement={AxisPlacement.LEFT}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </Griff>,
  ])
  .add('Misleading placements', () => [
    <Griff key="series" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </Griff>,
  ])
  .add('Collapsed axis', () => [
    <Griff key="series" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart
        height={CHART_HEIGHT}
        yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
        yAxisPlacement={AxisPlacement.BOTH}
      />
    </Griff>,
    <Griff key="collections" loader={staticLoader} timeDomain={staticXDomain}>
      <Collection
        id="1+2"
        color="red"
        yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.BOTH} />
    </Griff>,
  ])
  .add('Mixed axis modes', () => [
    <Griff key="series" loader={staticLoader} timeDomain={staticXDomain}>
      <Series
        id="1"
        color="steelblue"
        yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
      />
      <Series
        id="2"
        color="maroon"
        yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
      />
      <Series id="3" color="orange" yAxisDisplayMode={AxisDisplayMode.ALL} />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.BOTH} />
    </Griff>,
    <Griff key="collections" loader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="all" color="red">
        <Series
          id="1"
          color="steelblue"
          yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
        />
        <Series
          id="2"
          color="maroon"
          yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
        />
        <Series id="3" color="orange" yAxisDisplayMode={AxisDisplayMode.ALL} />
      </Collection>
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.BOTH} />
    </Griff>,
  ]);
