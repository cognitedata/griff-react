import React from 'react';
import {
  AxisDisplayMode,
  DataProvider,
  LineChart,
  Collection,
  Series,
} from '../src';
import { staticLoader } from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

export default {
  title: 'Demo|Series Collections',
};

export const singleCollection = () => (
  <>
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
    </DataProvider>
    ,
    <DataProvider
      key="scaled"
      timeDomain={staticXDomain}
      defaultLoader={staticLoader}
    >
      <Collection id="all" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" yAccessor={d => d.value + 2} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
    ,
  </>
);

singleCollection.story = {
  name: 'Single collection',
};

export const multipleCollections = () => (
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
);

multipleCollections.story = {
  name: 'Multiple collections',
};

export const mixedItems = () => (
  <DataProvider timeDomain={staticXDomain} defaultLoader={staticLoader}>
    <Collection id="1+2" color="red">
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
    </Collection>
    <Series id="3" color="orange" />
    <LineChart height={CHART_HEIGHT} />
  </DataProvider>
);

mixedItems.story = {
  name: 'Mixed items',
};

export const drawPointsStory = () => (
  <>
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
    </DataProvider>
    ,
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
    </DataProvider>
    ,
  </>
);

drawPointsStory.story = {
  name: 'drawPoints',
};

export const hiddenStory = () => (
  <>
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
    </DataProvider>
    ,
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
    </DataProvider>
    ,
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
    </DataProvider>
    ,
  </>
);

hiddenStory.story = {
  name: 'hidden',
};

export const strokeWidthStory = () => (
  <>
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
    </DataProvider>
    ,
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
    </DataProvider>
    ,
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
    </DataProvider>
    ,
  </>
);

strokeWidthStory.story = {
  name: 'strokeWidth',
};

export const y0AccessorStory = () => {
  const y0Accessor = d => d.value - 0.5;
  const y1Accessor = d => d.value + 0.5;
  return (
    <>
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
      </DataProvider>
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
      </DataProvider>
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
      </DataProvider>
    </>
  );
};

y0AccessorStory.story = {
  name: 'y0Accessor',
};

export const yAxisDisplayModeStory = () => (
  <>
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
    </DataProvider>
    ,
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
    </DataProvider>
    ,
  </>
);

yAxisDisplayModeStory.story = {
  name: 'yAxisDisplayMode',
};

export const yDomainStory = () => (
  <>
    {/* The yDomain is provided on the collection; the axis should have this 
      yDomain. */}
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
    </DataProvider>
    {/* The yDomain is also provided on one series -- this override should be
      ignored because it is ignored when in a collection. */}
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
    </DataProvider>
    {/* The two series are offset so that the context chart behavior can be
      verified. The context chart should use the same initial (unscaled)
      yDomain as the collection. */}
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
    </DataProvider>
  </>
);

yDomainStory.story = {
  name: 'yDomain',
};

export const colors = () => (
  <>
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
    </DataProvider>
    {/* No color is specified; YAxis should use its default color. */}
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
    </DataProvider>
    {/* A color is specified; the series' colors should override. */}
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
    </DataProvider>
    ,
  </>
);

colors.story = {
  name: 'colors',
};
