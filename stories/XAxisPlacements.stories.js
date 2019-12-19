import React from 'react';
import {
  DataProvider,
  LineChart,
  AxisPlacement,
  Series,
  Collection,
} from '../src';
import { staticLoader } from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

export default {
  title: 'Demo|X-Axis Placement',
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
      <Collection id="all" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  </>
);

export const top = () => (
  <>
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.TOP} />
    </DataProvider>
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Collection id="all" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.TOP} />
    </DataProvider>
  </>
);

export const bottom = () => (
  <>
    <DataProvider
      key="series"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.BOTTOM} />
    </DataProvider>
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Collection id="all" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.BOTTOM} />
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
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.BOTH} />
    </DataProvider>
    <DataProvider
      key="collections"
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
    >
      <Collection id="all" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} xAxisPlacement={AxisPlacement.BOTH} />
    </DataProvider>
  </>
);
