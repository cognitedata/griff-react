import React from 'react';
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

export default {
  title: 'Demo|Y-Axis Placement',
};

export const unspecified = () => (
  <>
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
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
    </DataProvider>
  </>
);

export const left = () => (
  <>
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.LEFT} />
    </DataProvider>
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
    </DataProvider>
  </>
);

export const right = () => (
  <>
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </DataProvider>
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
    </DataProvider>
  </>
);

export const both = () => (
  <>
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.BOTH} />
    </DataProvider>
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
    </DataProvider>
  </>
);

export const split = () => (
  <>
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      <Series id="2" color="maroon" yAxisPlacement={AxisPlacement.RIGHT} />
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
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
    </DataProvider>
  </>
);

export const splitWithBoth = () => (
  <>
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id={1} color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      <Series id={2} color="maroon" yAxisPlacement={AxisPlacement.RIGHT} />
      <Series id={3} color="orange" yAxisPlacement={AxisPlacement.BOTH} />
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
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
    </DataProvider>
  </>
);

splitWithBoth.story = {
  name: 'Split, with BOTH',
};

export const splitOverridingChart = () => (
  <>
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id={1} color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      <Series id={2} color="maroon" yAxisPlacement={AxisPlacement.RIGHT} />
      <Series id={3} color="orange" yAxisPlacement={AxisPlacement.BOTH} />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.LEFT} />
    </DataProvider>
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
    </DataProvider>
  </>
);

splitOverridingChart.story = {
  name: 'Split, overriding chart',
};

export const allOnTheWrongSide = () => (
  <>
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      <Series id="2" color="maroon" yAxisPlacement={AxisPlacement.LEFT} />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </DataProvider>
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
    </DataProvider>
  </>
);

allOnTheWrongSide.story = {
  name: 'All on the wrong side',
};

export const misleadingPlacements = () => (
  <>
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" yAxisPlacement={AxisPlacement.LEFT} />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} yAxisPlacement={AxisPlacement.RIGHT} />
    </DataProvider>
  </>
);

misleadingPlacements.story = {
  name: 'Misleading placements',
};

export const collapsedAxis = () => (
  <>
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
    </DataProvider>
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
    </DataProvider>
  </>
);

collapsedAxis.story = {
  name: 'Collapsed axis',
};

export const mixedAxisModes = () => (
  <>
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
    </DataProvider>
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
    </DataProvider>
  </>
);

mixedAxisModes.story = {
  name: 'Mixed axis modes',
};
