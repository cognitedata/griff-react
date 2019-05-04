import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import moment from 'moment';
import {
  AxisPlacement,
  ContextChart,
  DataProvider,
  GridLines,
  Scatterplot,
  Series,
  Collection,
} from '../build/src';
import { staticLoader, functionLoader } from './loaders';

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
  'pow-y': { x: () => Math.random(), y: () => Math.random() * 10 },
  'sum-y': { x: () => Math.random(), y: () => Math.random() + 19 },
  'pow-x': { y: () => Math.random(), x: () => Math.random() * 10 },
  'sum-x': { y: () => Math.random(), x: () => Math.random() + 9 },
};

const NUM_POINTS = 50;

const scatterplotloader = ({ id, reason, oldSeries, ...params }) => {
  action('scatterplotloader')(reason);
  if (reason === 'MOUNTED') {
    const pair = mapping[id] || Math.round(Math.random() * 100);
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
    const lastKnown = { x: undefined, y: undefined, timestamp: undefined };
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
      lastKnown.timestamp = point.timestamp;
      if (
        lastKnown.x !== undefined &&
        lastKnown.y !== undefined &&
        lastKnown.timestamp !== undefined
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

const scatterplotFunctionLoader = ({
  id,
  reason,
  oldSeries,
  timeDomain,
  timeSubDomain,
  ...params
}) => {
  action('scatterplotFunctionLoader')(reason);
  const dt = timeDomain[1] - timeDomain[0];
  const pair = mapping[id];
  const { x, y } = {
    x: functionLoader(d => Math.sin((d / dt) * 2 * Math.PI))({
      id: pair.x,
      reason,
      timeSubDomain,
      ...params,
    }),
    y: functionLoader(d => Math.cos((d / dt) * 2 * Math.PI))({
      id: pair.y,
      reason,
      timeSubDomain,
      ...params,
    }),
  };

  const newData = [];
  const lastKnown = { x: undefined, y: undefined, timestamp: undefined };
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
    lastKnown.timestamp = point.timestamp;
    if (
      lastKnown.x !== undefined &&
      lastKnown.y !== undefined &&
      lastKnown.timestamp !== undefined
    ) {
      newData.push({
        ...lastKnown,
      });
    }
  }

  const data = []
    .concat(oldSeries.data.filter(d => d.timestamp <= timeSubDomain[0]))
    .concat(newData)
    .concat(oldSeries.data.filter(d => d.timestamp >= timeSubDomain[1]));

  return { data };
};

const randomColor = () => {
  const hex = ['r', 'g', 'b']
    .map(() =>
      `0${Number(Math.round(Math.random() * 255)).toString(16)}`.slice(-2)
    )
    .join('');
  return `#${hex}`;
};

const generateSeries = count => {
  const series = [];
  for (let i = 0; i < count; i += 1) {
    series.push(<Series id={`${i} ${i + 1}`} color={randomColor()} />);
  }
  return series;
};

const latestPointRenderer = (
  d,
  i,
  array,
  { x, y, x0, x1, y0, y1, color },
  defaultPoints
) => {
  if (i === array.length - 1) {
    const size = 10;
    const points = [
      `${x0 || x - size} ${y}`,
      `${x} ${y1 || y - size}`,
      `${x1 || x + size} ${y}`,
      `${x} ${y0 || y + size}`,
    ];
    return (
      <polygon key={`${x},${y},${i}`} points={points.join(',')} fill={color} />
    );
  }
  return defaultPoints;
};

storiesOf('Scatterplot', module)
  .addDecorator(story => (
    <div
      style={{
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '80%',
        height: '100%',
      }}
    >
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
            timeDomain={[0, 1]}
            xAccessor={d => +d.x}
            yAccessor={d => +d.y}
          >
            <Series id="1 2" color="steelblue" drawPoints />
            <Scatterplot zoomable />
          </DataProvider>
        </div>
      </div>
      <div>
        <h3>One collection</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            timeDomain={[0, 1]}
            collections={[]}
            xAccessor={d => +d.x}
            yAccessor={d => +d.y}
          >
            <Collection id="scatter" drawPoints>
              <Series id="1 2" color="steelblue" />
              <Series id="2 3" color="maroon" />
            </Collection>
            <Scatterplot zoomable />
          </DataProvider>
        </div>
      </div>
      <div>
        <h3>Geometric series</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            timeDomain={[0, 1]}
            xAccessor={d => +d.x}
            yAccessor={d => +d.y}
            drawPoints
          >
            <Series id="sincos" color="#ACF39D" />
            <Series id="sintan" color="#E85F5C" />
            <Series id="pow" color="#9CFFFA" />
            <Scatterplot zoomable />
          </DataProvider>
        </div>
      </div>
      <div>
        <h3>Many pairs</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            timeDomain={[0, 1]}
            xAccessor={d => +d.x}
            yAccessor={d => +d.y}
            drawPoints
          >
            {generateSeries(10)}
            <Scatterplot zoomable />
          </DataProvider>
        </div>
      </div>
    </React.Fragment>
  ))
  .add('Different domains', () => (
    <React.Fragment>
      <div>
        <h3>Different Y domains</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            timeDomain={[0, 1]}
            xAccessor={d => +d.x}
            yAccessor={d => +d.y}
            drawPoints
          >
            <Collection id="scatter">
              <Series id="1 2" color="steelblue" />
              <Series id="sum-y" color="maroon" />
            </Collection>
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
            timeDomain={[0, 1]}
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
            timeDomain={[0, 1]}
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
            timeDomain={[0, 1]}
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
            timeDomain={[0, 1]}
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
            timeDomain={[0, 1]}
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
          timeDomain={[0, 1]}
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
        timeDomain={[0, 1]}
        series={[{ id: '1 2', color: 'steelblue' }]}
        xAccessor={d => +d.x}
        yAccessor={d => +d.y}
      >
        <Scatterplot zoomable xAxisTicks={5} yAxisTicks={5}>
          <GridLines x={{ ticks: 5 }} y={{ count: 5, seriesIds: ['1 2'] }} />
        </Scatterplot>
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
              timeDomain={[0, 1]}
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
              timeDomain={[0, 1]}
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
          timeDomain={[0, 1]}
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
  .add('Split axes', () => (
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
        timeDomain={[0, 1]}
        xDomain={[-1, 2]}
        yDomain={[-1, 2]}
        collections={[
          { id: 'left', color: 'red', yAxisPlacement: AxisPlacement.LEFT },
          { id: 'right', color: 'blue', yAxisPlacement: AxisPlacement.RIGHT },
        ]}
        series={[
          { id: '1 2', collectionId: 'left', color: 'steelblue' },
          { id: '2 3', collectionId: 'left', color: 'maroon' },
          { id: '3 4', collectionId: 'right', color: 'black' },
          { id: '4 5', collectionId: 'right', color: 'gray' },
        ]}
        xAccessor={d => +d.x}
        yAccessor={d => +d.y}
      >
        <Scatterplot zoomable />
      </DataProvider>
    </div>
  ))
  .add('Stroke width', () => (
    <React.Fragment>
      <div style={{ height: '500px', width: '500px' }}>
        <DataProvider
          defaultLoader={scatterplotloader}
          timeDomain={[0, 1]}
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
          timeDomain={[0, 1]}
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
          timeDomain={[0, 1]}
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
          timeDomain={[0, 1]}
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
          timeDomain={[0, 1]}
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
          timeDomain={[0, 1]}
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
          timeDomain={[0, 1]}
          series={[
            { id: '1 2', color: 'steelblue' },
            { id: '3 4', color: 'maroon' },
          ]}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
          opacityAccessor={(d, i, arr) => (i / arr.length) * 0.9 + 0.1}
          pointWidth={20}
        >
          <Scatterplot zoomable />
        </DataProvider>
      </div>
    </React.Fragment>
  ))
  .add('Min/Max', () => (
    <React.Fragment>
      <div style={{ height: '500px', width: '500px' }}>
        <DataProvider
          defaultLoader={scatterplotloader}
          timeDomain={[0, 1]}
          series={[
            { id: '1 2', color: 'steelblue' },
            { id: '3 4', color: 'maroon' },
          ]}
          xAccessor={d => +d.x}
          x0Accessor={d => +d.x * 0.9}
          x1Accessor={d => +d.x * 1.1}
          yAccessor={d => +d.y}
          y0Accessor={d => +d.y * 0.9}
          y1Accessor={d => +d.y * 1.1}
        >
          <Scatterplot zoomable />
        </DataProvider>
      </div>
    </React.Fragment>
  ))
  .add('Context Chart', () => (
    <React.Fragment>
      <div style={{ width: 500 }}>
        <DataProvider
          defaultLoader={scatterplotFunctionLoader}
          timeDomain={[+moment().subtract(1, 'year'), +moment()]}
          pointsPerSeries={100}
          series={[{ id: '1 2', color: 'steelblue' }]}
          timeAccessor={d => +d.timestamp}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
        >
          <div style={{ height: 500 }}>
            <Scatterplot zoomable />
          </div>
          <div style={{ width: 450 }}>
            <ContextChart />
          </div>
        </DataProvider>
      </div>
    </React.Fragment>
  ))
  .add('Zoomable', () => (
    <React.Fragment>
      <div style={{ width: 500, height: 500 }}>
        <DataProvider
          defaultLoader={scatterplotFunctionLoader}
          timeDomain={[+moment().subtract(1, 'year'), +moment()]}
          pointsPerSeries={100}
          series={[{ id: '1 2', color: 'steelblue' }]}
          timeAccessor={d => +d.timestamp}
          xAccessor={d => +d.x}
          yAccessor={d => +d.y}
        >
          <Scatterplot zoomable={false} />
        </DataProvider>
      </div>
    </React.Fragment>
  ))
  .add('Draw lines', () => (
    <React.Fragment>
      <div>
        <h3>Set on DataProvider</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            timeDomain={[0, 1]}
            series={[
              { id: 'sincos', color: '#ACF39D' },
              { id: 'sintan', color: '#E85F5C' },
              { id: 'pow', color: '#9CFFFA' },
            ]}
            xAccessor={d => +d.x}
            yAccessor={d => +d.y}
            drawLines
          >
            <Scatterplot zoomable />
          </DataProvider>
        </div>
      </div>
      <div>
        <h3>Set on the series</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            timeDomain={[0, 1]}
            series={[
              { id: 'sincos', color: '#ACF39D', drawLines: true },
              {
                id: 'sintan',
                color: '#E85F5C',
                drawLines: true,
                drawPoints: false,
                strokeWidth: 20,
                opacity: 0.2,
              },
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
        <h3>Set on the collection</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            timeDomain={[0, 1]}
            series={[
              { id: 'sincos', color: '#ACF39D', collectionId: 'scatter' },
              { id: 'sintan', color: '#E85F5C', collectionId: 'scatter' },
              { id: 'pow', color: '#9CFFFA' },
            ]}
            collections={[
              {
                id: 'scatter',
                color: 'black',
                drawLines: true,
                drawPoints: false,
                strokeWidth: 1,
              },
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
  .add('Point Renderer', () => (
    <React.Fragment>
      <div>
        <h3>Set on DataProvider</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            timeDomain={[0, 1]}
            series={[{ id: '1 2', color: 'steelblue' }]}
            xAccessor={d => +d.x}
            yAccessor={d => +d.y}
            drawPoints={latestPointRenderer}
          >
            <Scatterplot zoomable />
          </DataProvider>
        </div>
      </div>
      <div>
        <h3>Set on the series</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            timeDomain={[0, 1]}
            series={[
              {
                id: '1 2',
                color: 'steelblue',
                drawPoints: latestPointRenderer,
              },
              {
                id: '2 3',
                color: 'maroon',
                drawPoints: latestPointRenderer,
              },
            ]}
            xAccessor={d => +d.x}
            yAccessor={d => +d.y}
          >
            <Scatterplot zoomable />
          </DataProvider>
        </div>
      </div>
      <div>
        <h3>Set on the collection</h3>
        <div style={{ height: '500px', width: '100%' }}>
          <DataProvider
            defaultLoader={scatterplotloader}
            timeDomain={[0, 1]}
            series={[
              { id: '1 2', color: 'steelblue', collectionId: 'scatter' },
              { id: '2 3', color: 'maroon', collectionId: 'scatter' },
            ]}
            collections={[
              {
                id: 'scatter',
                color: 'black',
                drawPoints: latestPointRenderer,
              },
            ]}
            xAccessor={d => +d.x}
            yAccessor={d => +d.y}
          >
            <Scatterplot zoomable />
          </DataProvider>
        </div>
      </div>
    </React.Fragment>
  ));
