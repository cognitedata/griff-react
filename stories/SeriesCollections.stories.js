import React from 'react';
import { storiesOf } from '@storybook/react';
import {
  AxisDisplayMode,
  DataProvider,
  LineChart,
  Collection,
  Series,
} from '../build/src';
import { staticLoader } from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('Series Collections', module)
  .add('Single collection', () => [
    <DataProvider
      key="simple"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="all" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    // <DataProvider
    //   key="scaled"
    //   timeDomain={staticXDomain}
    //   defaultLoader={staticLoader}
    // >
    //   <Collection id="all" color="red">
    //     <Series id="1" color="steelblue" />
    //     <Series id="2" color="maroon" yAccessor={d => d.value + 2} />
    //   </Collection>
    //   <LineChart height={CHART_HEIGHT} />
    // </DataProvider>,
  ])
  .add('Multiple collections', () => (
    <DataProvider timeDomain={staticXDomain} defaultLoader={staticLoader}>
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <Collection id="3+4" color="gray">
        <Series id="3" color="orange" />
        <Series id="4" color="green" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Mixed items', () => (
    <DataProvider timeDomain={staticXDomain} defaultLoader={staticLoader}>
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <Series id="3" color="orange" />
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('drawPoints', () => [
    <DataProvider
      key="default"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="1+2" color="red" drawPoints>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="override"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="1+2" color="red" drawPoints>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" drawPoints={false} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ])
  .add('hidden', () => [
    <DataProvider
      key="default"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="1+2" color="red" hidden>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="preference"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" hidden />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="override"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="1+2" color="red" hidden>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" hidden={false} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ])
  .add('strokeWidth', () => [
    <DataProvider
      key="default"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="1+2" color="red" strokeWidth={3}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="preference"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" strokeWidth={2} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="override"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="1+2" color="red" strokeWidth={3}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" strokeWidth={1} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ])
  .add('y0Accessor', () => {
    const y0Accessor = d => d.value - 0.5;
    const y1Accessor = d => d.value + 0.5;
    return [
      <DataProvider
        key="default"
        timeDomain={staticXDomain}
        defaultLoader={staticLoader}
      >
        <Collection
          id="1+2"
          color="red"
          y0Accessor={y0Accessor}
          y1Accessor={y1Accessor}
        >
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" />
        </Collection>
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>,
      <DataProvider
        key="preference"
        timeDomain={staticXDomain}
        defaultLoader={staticLoader}
      >
        <Collection id="1+2" color="red">
          <Series id="1" color="steelblue" />
          <Series
            id="2"
            color="maroon"
            y0Accessor={y0Accessor}
            y1Accessor={y1Accessor}
          />
        </Collection>
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>,
      <DataProvider
        key="override"
        timeDomain={staticXDomain}
        defaultLoader={staticLoader}
      >
        <Collection
          id="1+2"
          color="red"
          y0Accessor={y0Accessor}
          y1Accessor={y1Accessor}
        >
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" y0Accessor={null} y1Accessor={null} />
        </Collection>
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>,
    ];
  })
  .add('yAxisDisplayMode', () => [
    <DataProvider
      key="default"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="1+2" color="red" yAxisDisplayMode={AxisDisplayMode.NONE}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    <DataProvider
      key="override"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="1+2" color="red" yAxisDisplayMode={AxisDisplayMode.NONE}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" yAxisDisplayMode={AxisDisplayMode.ALL} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ])
  .add('yDomain', () => [
    // The yDomain is provided on the collection; the axis should have this
    // yDomain.
    <DataProvider
      key="default"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="1+2" color="red" yDomain={[-4, 4]}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    // The yDomain is also provided on one series -- this override should be
    // ignored because it is ignored when in a collection.
    <DataProvider
      key="override"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="1+2" color="red" yDomain={[-5, 5]}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" yDomain={[0.5, 1]} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    // The two series are offset so that the context chart behavior can be
    // verified. The context chart should use the same initial (unscaled)
    // yDomain as the collection.
    <DataProvider
      key="scaled"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="1+2" color="red" yDomain={[-6, 6]}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" yAccessor={d => d.value + 2} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ])
  .add('colors', () => [
    <DataProvider
      key="default"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="1+2" color="red">
        <Series id="1" />
        <Series id="2" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    // No color is specified; YAxis should use its default color.
    <DataProvider
      key="unspecified"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="1+2">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
    // A color is specified; the series' colors should override.
    <DataProvider
      key="override"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>,
  ]);
