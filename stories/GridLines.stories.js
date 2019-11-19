import React from 'react';
import { action } from '@storybook/addon-actions';
import { DataProvider, LineChart, Series } from '../src';
import { staticLoader } from './loaders';
import GridLines from '../src/components/GridLines';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

export default {
  title: 'Demo|Grid Lines',
};

export const staticHorizontalLinesEvery35Pixels = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <LineChart onZoomXAxis={action('onZoomXAxis')} height={CHART_HEIGHT}>
      <GridLines y={{ pixels: 35 }} />
    </LineChart>
  </DataProvider>
);

staticHorizontalLinesEvery35Pixels.story = {
  name: 'Static horizontal lines every 35 pixels',
};

export const ThreeStaticHorizontalLines = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines y={{ count: 3 }} />
    </LineChart>
  </DataProvider>
);

ThreeStaticHorizontalLines.story = {
  name: '3 static horizontal lines',
};

export const staticVerticalLinesEvery35Pixels = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines x={{ pixels: 35 }} />
    </LineChart>
  </DataProvider>
);

staticVerticalLinesEvery35Pixels.story = {
  name: 'Static vertical lines every 35 pixels',
};

export const ThreeStaticVerticalLines = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines x={{ count: 3 }} />
    </LineChart>
  </DataProvider>
);

ThreeStaticVerticalLines.story = {
  name: '3 static vertical lines',
};

export const staticGridLinesEvery75Pixels = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines x={{ pixels: 75 }} y={{ pixels: 75 }} />
    </LineChart>
  </DataProvider>
);

staticGridLinesEvery75Pixels.story = {
  name: 'Static grid lines every 75 pixels',
};

export const ThreeGridLines = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines x={{ count: 3 }} y={{ count: 3 }} />
    </LineChart>
  </DataProvider>
);

ThreeGridLines.story = {
  name: '3 grid lines',
};

export const dynamicHorizontalLines = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines y={{ seriesIds: [1] }} />
    </LineChart>
  </DataProvider>
);

dynamicHorizontalLines.story = {
  name: 'Dynamic horizontal lines',
};

export const dynamicVerticalLines = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines x={{ ticks: 3 }} />
    </LineChart>
  </DataProvider>
);

dynamicVerticalLines.story = {
  name: 'Dynamic vertical lines',
};

export const dynamicGridLines = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines x={{ ticks: 0 }} y={{ seriesIds: [1] }} />
    </LineChart>
  </DataProvider>
);

dynamicGridLines.story = {
  name: 'Dynamic grid lines',
};

export const dynamicGridLinesMultipleSeries = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines x={{ ticks: 0 }} y={{ seriesIds: [1, 2], color: null }} />
    </LineChart>
  </DataProvider>
);

dynamicGridLinesMultipleSeries.story = {
  name: 'Dynamic grid lines (multiple series)',
};

export const colorStory = () => [
  <DataProvider
    key="y-dimension"
    defaultLoader={staticLoader}
    timeDomain={staticXDomain}
  >
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines y={{ count: 5, color: 'red' }} />
    </LineChart>
  </DataProvider>,
  <DataProvider
    key="x-dimension"
    defaultLoader={staticLoader}
    timeDomain={staticXDomain}
  >
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines x={{ count: 5, color: 'red' }} />
    </LineChart>
  </DataProvider>,
  <DataProvider
    key="grid-object"
    defaultLoader={staticLoader}
    timeDomain={staticXDomain}
  >
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines color="red" x={{ count: 5 }} y={{ count: 5 }} />
    </LineChart>
  </DataProvider>,
  <DataProvider
    key="different"
    defaultLoader={staticLoader}
    timeDomain={staticXDomain}
  >
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines
        color="yellow"
        x={{ count: 5, color: 'orange' }}
        y={{ count: 5, color: 'green' }}
      />
    </LineChart>
  </DataProvider>,
];

colorStory.story = {
  name: 'color',
};

export const opacityStory = () => [
  <DataProvider
    key="y-dimension"
    defaultLoader={staticLoader}
    timeDomain={staticXDomain}
  >
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines y={{ count: 5, opacity: 1 }} />
    </LineChart>
  </DataProvider>,
  <DataProvider
    key="x-dimension"
    defaultLoader={staticLoader}
    timeDomain={staticXDomain}
  >
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines x={{ count: 5, opacity: 1 }} />
    </LineChart>
  </DataProvider>,
  <DataProvider
    key="grid-object"
    defaultLoader={staticLoader}
    timeDomain={staticXDomain}
  >
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines opacity={1} x={{ count: 5 }} y={{ count: 5 }} />
    </LineChart>
  </DataProvider>,
  <DataProvider
    key="different"
    defaultLoader={staticLoader}
    timeDomain={staticXDomain}
  >
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines
        opacity={0}
        x={{ count: 5, opacity: 0.5 }}
        y={{ count: 5, opacity: 1 }}
      />
    </LineChart>
  </DataProvider>,
];

opacityStory.story = {
  name: 'opacity',
};

export const strokeWidthStory = () => [
  <DataProvider
    key="y-dimension"
    defaultLoader={staticLoader}
    timeDomain={staticXDomain}
  >
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines y={{ count: 5, strokeWidth: 5 }} />
    </LineChart>
  </DataProvider>,
  <DataProvider
    key="x-dimension"
    defaultLoader={staticLoader}
    timeDomain={staticXDomain}
  >
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines x={{ count: 5, strokeWidth: 5 }} />
    </LineChart>
  </DataProvider>,
  <DataProvider
    key="grid-object"
    defaultLoader={staticLoader}
    timeDomain={staticXDomain}
  >
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines strokeWidth={5} x={{ count: 5 }} y={{ count: 5 }} />
    </LineChart>
  </DataProvider>,
  <DataProvider
    key="different"
    defaultLoader={staticLoader}
    timeDomain={staticXDomain}
  >
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart height={CHART_HEIGHT}>
      <GridLines
        strokeWidth={15}
        x={{ count: 5, strokeWidth: 5 }}
        y={{ count: 5, strokeWidth: 10 }}
      />
    </LineChart>
  </DataProvider>,
];

strokeWidthStory.story = {
  name: 'strokeWidth',
};
