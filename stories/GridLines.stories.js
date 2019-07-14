import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Griff, LineChart, Series } from '../build/src';
import { staticLoader } from './loaders';
import GridLines from '../build/src/components/GridLines';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('components/GridLines', module)
  .add('Static horizontal lines every 35 pixels', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <LineChart onZoomXAxis={action('onZoomXAxis')} height={CHART_HEIGHT}>
        <GridLines y={{ pixels: 35 }} />
      </LineChart>
    </Griff>
  ))
  .add('3 static horizontal lines', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines y={{ count: 3 }} />
      </LineChart>
    </Griff>
  ))
  .add('Static vertical lines every 35 pixels', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ pixels: 35 }} />
      </LineChart>
    </Griff>
  ))
  .add('3 static vertical lines', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ count: 3 }} />
      </LineChart>
    </Griff>
  ))
  .add('Static grid lines every 75 pixels', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ pixels: 75 }} y={{ pixels: 75 }} />
      </LineChart>
    </Griff>
  ))
  .add('3 grid lines', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ count: 3 }} y={{ count: 3 }} />
      </LineChart>
    </Griff>
  ))
  .add('Dynamic horizontal lines', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines y={{ seriesIds: [1] }} />
      </LineChart>
    </Griff>
  ))
  .add('Dynamic vertical lines', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ ticks: 3 }} />
      </LineChart>
    </Griff>
  ))
  .add('Dynamic grid lines', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ ticks: 0 }} y={{ seriesIds: [1] }} />
      </LineChart>
    </Griff>
  ))
  .add('Dynamic grid lines (multiple series)', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ ticks: 0 }} y={{ seriesIds: [1, 2], color: null }} />
      </LineChart>
    </Griff>
  ))
  .add('color', () => [
    <Griff key="y-dimension" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines y={{ count: 5, color: 'red' }} />
      </LineChart>
    </Griff>,
    <Griff key="x-dimension" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ count: 5, color: 'red' }} />
      </LineChart>
    </Griff>,
    <Griff key="grid-object" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines color="red" x={{ count: 5 }} y={{ count: 5 }} />
      </LineChart>
    </Griff>,
    <Griff key="different" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines
          color="yellow"
          x={{ count: 5, color: 'orange' }}
          y={{ count: 5, color: 'green' }}
        />
      </LineChart>
    </Griff>,
  ])
  .add('opacity', () => [
    <Griff key="y-dimension" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines y={{ count: 5, opacity: 1 }} />
      </LineChart>
    </Griff>,
    <Griff key="x-dimension" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ count: 5, opacity: 1 }} />
      </LineChart>
    </Griff>,
    <Griff key="grid-object" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines opacity={1} x={{ count: 5 }} y={{ count: 5 }} />
      </LineChart>
    </Griff>,
    <Griff key="different" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines
          opacity={0}
          x={{ count: 5, opacity: 0.5 }}
          y={{ count: 5, opacity: 1 }}
        />
      </LineChart>
    </Griff>,
  ])
  .add('strokeWidth', () => [
    <Griff key="y-dimension" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines y={{ count: 5, strokeWidth: 5 }} />
      </LineChart>
    </Griff>,
    <Griff key="x-dimension" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines x={{ count: 5, strokeWidth: 5 }} />
      </LineChart>
    </Griff>,
    <Griff key="grid-object" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines strokeWidth={5} x={{ count: 5 }} y={{ count: 5 }} />
      </LineChart>
    </Griff>,
    <Griff key="different" loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT}>
        <GridLines
          strokeWidth={15}
          x={{ count: 5, strokeWidth: 5 }}
          y={{ count: 5, strokeWidth: 10 }}
        />
      </LineChart>
    </Griff>,
  ]);
