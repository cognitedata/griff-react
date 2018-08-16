import React from 'react';
import 'react-select/dist/react-select.css';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { DataProvider, Scatterplot, AxisPlacement } from '../src';
import { staticLoader } from './loaders';

const mapping = {
  '1 2': { x: 1, y: 2 },
  '2 3': { x: 2, y: 3 },
  '3 4': { x: 3, y: 4 },
  '4 5': { x: 4, y: 5 },
  '5 6': { x: 5, y: 6 },
  '6 7': { x: 6, y: 7 },
  '7 8': { x: 7, y: 8 },
  '8 9': { x: 8, y: 9 },
  sincos: { x: Math.sin, y: Math.cos },
  sintan: { x: Math.sin, y: Math.tan },
  pow: { x: v => v, y: v => v * 10 },
};

const NUM_POINTS = 50;

const scatterplotloader = ({ id, reason, oldSeries, ...params }) => {
  if (reason === 'MOUNTED') {
    const pair = mapping[id];
    const { x, y } = {
      x: staticLoader({
        id: pair.x,
        n: NUM_POINTS,
        reason,
        oldSeries,
        ...params,
      }),
      y: staticLoader({
        id: pair.y,
        n: NUM_POINTS,
        reason,
        oldSeries,
        ...params,
      }),
    };

    const data = [];
    const lastKnown = { x: undefined, y: undefined, z: undefined };
    while (x.data.length || y.data.length) {
      const points = {
        x: x.data.length ? x.data[0] : { timestamp: Number.MAX_SAFE_INTEGER },
        y: y.data.length ? y.data[0] : { timestamp: Number.MAX_SAFE_INTEGER },
      };
      let point;
      if (points.x.timestamp <= points.y.timestamp) {
        point = x.data.shift();
        lastKnown.x = point.value;
      }
      if (points.y.timestamp <= points.x.timestamp) {
        point = y.data.shift();
        lastKnown.y = point.value;
      }
      lastKnown.z = point.timestamp;
      if (
        lastKnown.x !== undefined &&
        lastKnown.y !== undefined &&
        lastKnown.z !== undefined
      ) {
        data.push({
          ...lastKnown,
        });
      }
    }

    return { data };
  }
  return { data: oldSeries.data };
};

storiesOf('Scatterplot', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('Scatterplot (one series)', () => (
    <div style={{ height: '500px', width: '500px' }}>
      <DataProvider
        defaultLoader={scatterplotloader}
        baseDomain={[0, 1]}
        series={[{ id: '1 2', color: 'steelblue' }]}
        xAccessor={d => +d.x}
        yAccessor={d => +d.y}
      >
        <Scatterplot zoomable />
      </DataProvider>
    </div>
  ))
  .add('Left axes', () => (
    <div style={{ height: '500px', width: '500px' }}>
      <DataProvider
        defaultLoader={scatterplotloader}
        baseDomain={[0, 1]}
        series={[{ id: '1 2', color: 'steelblue' }]}
        xAccessor={d => +d.x}
        yAccessor={d => +d.y}
      >
        <Scatterplot zoomable yAxisPlacement={AxisPlacement.LEFT} />
      </DataProvider>
    </div>
  ))
  .add('Both axes', () => (
    <div style={{ height: '500px', width: '500px' }}>
      <DataProvider
        defaultLoader={scatterplotloader}
        baseDomain={[0, 1]}
        series={[{ id: '1 2', color: 'steelblue' }]}
        xAccessor={d => +d.x}
        yAccessor={d => +d.y}
      >
        <Scatterplot zoomable yAxisPlacement={AxisPlacement.BOTH} />
      </DataProvider>
    </div>
  ))
  .add('Scatterplot (Geometry series)', () => (
    <div style={{ height: '100vh', width: '100%' }}>
      <DataProvider
        defaultLoader={scatterplotloader}
        baseDomain={[0, 1]}
        series={[
          { id: 'sincos', color: '#ACF39D' },
          { id: 'sintan', color: '#E85F5C' },
          { id: 'pow', color: '#9CFFFA' },
        ]}
        xAccessor={d => +d.x}
        yAccessor={d => +d.y}
      >
        <Scatterplot zoomable />
      </DataProvider>
    </div>
  ))
  .add('Scatterplot (many pairs)', () => (
    <div style={{ height: '500px', width: '500px' }}>
      <DataProvider
        defaultLoader={scatterplotloader}
        baseDomain={[0, 1]}
        series={[
          { id: '1 2', color: '#ACF39D' },
          { id: '2 3', color: '#E85F5C' },
          { id: '3 4', color: '#9CFFFA' },
          { id: '4 5', color: '#773344' },
          { id: '5 6', color: '#E3B5A4' },
          { id: '6 7', color: '#2E0219' },
          { id: '7 8', color: '#2E0219' },
          { id: '8 9', color: '#2E0219' },
        ]}
        xAccessor={d => +d.x}
        yAccessor={d => +d.y}
      >
        <Scatterplot zoomable />
      </DataProvider>
    </div>
  ))
  .add('Scatterplot (stroke width)', () => (
    <div style={{ height: '500px', width: '500px' }}>
      <DataProvider
        defaultLoader={scatterplotloader}
        baseDomain={[0, 1]}
        series={[
          { id: '1 2', color: 'steelblue', strokeWidth: 2 },
          { id: '3 4', color: 'maroon', strokeWidth: 5 },
        ]}
        xAccessor={d => +d.x}
        yAccessor={d => +d.y}
      >
        <Scatterplot zoomable />
      </DataProvider>
    </div>
  ));
