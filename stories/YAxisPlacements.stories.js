import React from 'react';
import { storiesOf } from '@storybook/react';
import {
  DataProvider,
  LineChart,
  AxisPlacement,
  AxisDisplayMode,
  Series,
  Collection,
} from '../src';
import { staticLoader } from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('Y-Axis Placement', module)
  .add('Unspecified', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ])
  .add('Left', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.LEFT} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.LEFT} />
    </DataProvider>,
  ])
  .add('Right', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </DataProvider>,
  ])
  .add('Both', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.BOTH} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.BOTH} />
    </DataProvider>,
  ])
  .add('Split', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      <Series id="2" color="maroon" yAxisPlacement={AxisPlacement.RIGHT} />
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Collection id="1" color="red" yAxisPlacement={AxisPlacement.LEFT}>
        <Series id="1" color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      </Collection>
      <Collection id="2" color="blue" yAxisPlacement={AxisPlacement.RIGHT}>
        <Series id="2" color="maroon" yAxisPlacement={AxisPlacement.RIGHT} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ])
  .add('Split, with BOTH', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id={1} color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      <Series id={2} color="maroon" yAxisPlacement={AxisPlacement.RIGHT} />
      <Series id={3} color="orange" yAxisPlacement={AxisPlacement.BOTH} />
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
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
    </DataProvider>,
  ])
  .add('Split, overriding chart', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id={1} color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      <Series id={2} color="maroon" yAxisPlacement={AxisPlacement.RIGHT} />
      <Series id={3} color="orange" yAxisPlacement={AxisPlacement.BOTH} />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.LEFT} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
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
    </DataProvider>,
  ])
  .add('All on the wrong side', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      <Series id="2" color="maroon" yAxisPlacement={AxisPlacement.LEFT} />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Collection id="1+2" color="red" yAxisPlacement={AxisPlacement.LEFT}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </DataProvider>,
  ])
  .add('Misleading placements', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </DataProvider>,
  ])
  .add('Collapsed axis', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart
        height={CHART_HEIGHT}
        yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
        yAxisPlacement={AxisPlacement.BOTH}
      />
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Collection
        id="1+2"
        color="red"
        yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.BOTH} />
    </DataProvider>,
  ])
  .add('Mixed axis modes', () => [
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
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
    </DataProvider>,
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
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
    </DataProvider>,
  ]);
