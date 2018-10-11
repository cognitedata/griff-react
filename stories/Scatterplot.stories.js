import React from 'react';
import 'react-select/dist/react-select.css';
import { storiesOf } from '@storybook/react';
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
        xDomain: [0, 1],
      }),
      y: staticLoader({
        id: pair.y,
        n: NUM_POINTS,
        reason,
        oldSeries,
        ...params,
        xDomain: [0, 1],
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
  .add('Basic usage', () => (
    <React.Fragment>
      <div>
        <h3>One series</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            xDomain={[0, 1]}
            series={[{ id: '1 2', color: 'steelblue' }]}
            xAccessor={d => +d.x}
            yAccessor={d => +d.y}
          >
            <Scatterplot zoomable />
          </DataProvider>
        </div>
      </div>
      <div>
        <h3>Geometric series</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            xDomain={[0, 1]}
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
      </div>
      <div>
        <h3>Many pairs</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            xDomain={[0, 1]}
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
      </div>
    </React.Fragment>
  ))
  .add('Domains', () => (
    <React.Fragment>
      <div>
        <h3>Specified domains</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            xDomain={[-1, 2]}
            yDomain={[-1, 2]}
            series={[{ id: '1 2', color: 'steelblue' }]}
            xAccessor={d => +d.x}
            yAccessor={d => +d.y}
          >
            <Scatterplot zoomable />
          </DataProvider>
        </div>
      </div>
      <div>
        <h3>Specified x domain</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            xDomain={[-1, 2]}
            series={[{ id: '1 2', color: 'steelblue' }]}
            xAccessor={d => +d.x}
            yAccessor={d => +d.y}
          >
            <Scatterplot zoomable />
          </DataProvider>
        </div>
      </div>
      <div>
        <h3>Specified y domain</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            yDomain={[-1, 2]}
            series={[{ id: '1 2', color: 'steelblue' }]}
            xAccessor={d => +d.x}
            yAccessor={d => +d.y}
          >
            <Scatterplot zoomable />
          </DataProvider>
        </div>
      </div>
      <div>
        <h3>Calculated domains</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            series={[{ id: '1 2', color: 'steelblue' }]}
            xAccessor={d => +d.x}
            yAccessor={d => +d.y}
          >
            <Scatterplot zoomable />
          </DataProvider>
        </div>
      </div>
      <div>
        <h3>Smaller domains</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            xDomain={[0.25, 0.75]}
            yDomain={[0.25, 0.75]}
            series={[{ id: '1 2', color: 'steelblue' }]}
            xAccessor={d => +d.x}
            yAccessor={d => +d.y}
          >
            <Scatterplot zoomable />
          </DataProvider>
        </div>
      </div>
    </React.Fragment>
  ))
  .add('Custom tick formatting', () => (
    <React.Fragment>
      <div style={{ height: '500px', width: '100%' }}>
        <DataProvider
          defaultLoader={scatterplotloader}
          xDomain={[0, 1]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
        >
          <Scatterplot
            zoomable
            xAxisFormatter={n => n.toFixed(3)}
            yAxisFormatter={n => n.toFixed(2)}
          />
        </DataProvider>
      </div>
    </React.Fragment>
  ))
  .add('Grid', () => (
    <div style={{ height: '500px', width: '500px' }}>
      <DataProvider
        defaultLoader={scatterplotloader}
        xDomain={[0, 1]}
        series={[{ id: '1 2', color: 'steelblue' }]}
        xAccessor={d => +d.x}
        yAccessor={d => +d.y}
      >
        <Scatterplot
          zoomable
          grid={{ x: { ticks: 5 }, y: { count: 5, seriesIds: ['1 2'] } }}
          xAxisTicks={5}
          yAxisTicks={5}
        />
      </DataProvider>
    </div>
  ))
  .add('Axes', () => (
    <React.Fragment>
      {[AxisPlacement.RIGHT, AxisPlacement.BOTH, AxisPlacement.LEFT].map(
        placement => (
          <div
            key={placement}
            style={{
              width: '500px',
              height: '500px',
              outline: '1px solid red',
              margin: '1em',
            }}
          >
            <DataProvider
              defaultLoader={scatterplotloader}
              xDomain={[0, 1]}
              series={[{ id: '1 2', color: 'steelblue' }]}
              xAccessor={d => +d.x}
              yAccessor={d => +d.y}
            >
              <Scatterplot zoomable yAxisPlacement={placement} />
            </DataProvider>
          </div>
        )
      )}
      {[AxisPlacement.TOP, AxisPlacement.BOTH, AxisPlacement.BOTTOM].map(
        placement => (
          <div
            key={placement}
            style={{
              width: '500px',
              height: '500px',
              outline: '1px solid red',
              margin: '1em',
            }}
          >
            <DataProvider
              defaultLoader={scatterplotloader}
              xDomain={[0, 1]}
              series={[{ id: '1 2', color: 'steelblue' }]}
              xAccessor={d => +d.x}
              yAccessor={d => +d.y}
            >
              <Scatterplot zoomable xAxisPlacement={placement} />
            </DataProvider>
          </div>
        )
      )}
      <div
        style={{
          width: '500px',
          height: '500px',
          outline: '1px solid red',
          margin: '1em',
        }}
      >
        <DataProvider
          defaultLoader={scatterplotloader}
          xDomain={[0, 1]}
          series={[{ id: '1 2', color: 'steelblue' }]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
        >
          <Scatterplot
            zoomable
            xAxisPlacement={AxisPlacement.BOTH}
            yAxisPlacement={AxisPlacement.BOTH}
          />
        </DataProvider>
      </div>
    </React.Fragment>
  ))
  .add('Stroke width', () => (
    <React.Fragment>
      <div style={{ height: '500px', width: '500px' }}>
        <DataProvider
          defaultLoader={scatterplotloader}
          xDomain={[0, 1]}
          series={[
            { id: '1 2', color: 'steelblue', strokeWidth: 2 },
            { id: '3 4', color: 'maroon', strokeWidth: 10 },
          ]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
        >
          <Scatterplot zoomable />
        </DataProvider>
      </div>
      <div style={{ height: '500px', width: '500px' }}>
        <DataProvider
          defaultLoader={scatterplotloader}
          xDomain={[0, 1]}
          series={[
            { id: '1 2', color: 'steelblue' },
            { id: '3 4', color: 'maroon' },
          ]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
          strokeWidth={10}
        >
          <Scatterplot zoomable />
        </DataProvider>
      </div>
    </React.Fragment>
  ))
  .add('Point width', () => (
    <React.Fragment>
      <div style={{ height: '500px', width: '500px' }}>
        <DataProvider
          defaultLoader={scatterplotloader}
          xDomain={[0, 1]}
          series={[
            { id: '1 2', color: 'steelblue', pointWidth: 2 },
            { id: '3 4', color: 'maroon', pointWidth: 10 },
          ]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
        >
          <Scatterplot zoomable />
        </DataProvider>
      </div>
      <div style={{ height: '500px', width: '500px' }}>
        <DataProvider
          defaultLoader={scatterplotloader}
          xDomain={[0, 1]}
          series={[
            { id: '1 2', color: 'steelblue' },
            { id: '3 4', color: 'maroon' },
          ]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
          pointWidth={10}
        >
          <Scatterplot zoomable />
        </DataProvider>
      </div>
      <div style={{ height: '500px', width: '500px' }}>
        <DataProvider
          defaultLoader={scatterplotloader}
          xDomain={[0, 1]}
          series={[
            { id: '1 2', color: 'steelblue' },
            { id: '3 4', color: 'maroon' },
          ]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
          pointWidthAccessor={d => ((+d.x + +d.y) / 2) * 16 + 1}
        >
          <Scatterplot zoomable />
        </DataProvider>
      </div>
    </React.Fragment>
  ))
  .add('Opacity', () => (
    <React.Fragment>
      <div style={{ height: '500px', width: '500px' }}>
        <DataProvider
          defaultLoader={scatterplotloader}
          xDomain={[0, 1]}
          series={[
            { id: '1 2', color: 'steelblue', opacity: 0.25 },
            { id: '3 4', color: 'maroon', opacity: 0.75 },
          ]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
          pointWidth={10}
        >
          <Scatterplot zoomable />
        </DataProvider>
      </div>
      <div style={{ height: '500px', width: '500px' }}>
        <DataProvider
          defaultLoader={scatterplotloader}
          xDomain={[0, 1]}
          series={[
            { id: '1 2', color: 'steelblue' },
            { id: '3 4', color: 'maroon' },
          ]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
          opacityAccessor={d => (+d.x + +d.y) / 2}
          pointWidth={20}
        >
          <Scatterplot zoomable />
        </DataProvider>
      </div>
    </React.Fragment>
  ));
