import React from 'react';
import { DataProvider, LineChart, Series, Scatterplot } from '../src';

import { staticLoader } from './loaders';
import ToggleRenderer from './ToggleRenderer';
import { scatterplotloader } from './Scatterplot.stories';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

export default {
  title: 'components/Series',

  decorators: [
    story => (
      <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
        {story()}
      </div>
    ),
  ],
};

export const basicLineChart = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" />
    <LineChart height={CHART_HEIGHT} />
  </DataProvider>
);

basicLineChart.story = {
  name: 'Basic LineChart',
};

export const basicScatterplot = () => (
  <DataProvider
    defaultLoader={scatterplotloader}
    timeDomain={[0, 1]}
    xAccessor={d => +d.x}
    yAccessor={d => +d.y}
  >
    <Series id="1 2" color="steelblue" drawPoints />
    <div style={{ height: '500px', width: '100%' }}>
      <Scatterplot zoomable />
    </div>
  </DataProvider>
);

export const changeProps = () => (
  <ToggleRenderer seriesIds={['first', 'second']} />
);

changeProps.story = {
  name: 'Change props',
};
