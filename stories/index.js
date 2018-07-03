import React from 'react';
import moment from 'moment';
import Select from 'react-select';
import isEqual from 'lodash.isequal';
import 'react-select/dist/react-select.css';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withInfo } from '@storybook/addon-info';
import * as d3 from 'd3';
import {
  DataProvider,
  LineChart,
  Brush,
  AxisDisplayMode,
  Scatterplot,
} from '../src';
import quandlLoader from './quandlLoader';

const randomData = ({ baseDomain, n = 250, singleValue = undefined }) => {
  const data = [];
  const dt = (baseDomain[1] - baseDomain[0]) / n;
  for (let i = baseDomain[0]; data.length < n; i += dt) {
    const value = singleValue === undefined ? Math.random() : singleValue;
    data.push({
      timestamp: i,
      value,
    });
  }
  return data;
};

const monoLoader = singleValue => ({ baseDomain, oldSeries, reason }) => {
  if (reason === 'MOUNTED') {
    return {
      data: randomData({ baseDomain, n: 250, singleValue }),
    };
  }
  return {
    data: oldSeries.data,
  };
};

const staticLoader = ({
  id,
  baseDomain,
  n = 250,
  multiplier = 1,
  oldSeries,
  reason,
}) => {
  action('LOADER_REQUEST_DATA')(id, reason);
  if (reason === 'MOUNTED') {
    // Create dataset on mount
    return {
      data: randomData({ baseDomain, n, multiplier }),
    };
  }
  // Otherwise, return the existing dataset.
  return {
    data: oldSeries.data,
  };
};

const liveLoader = ({ oldSeries, baseDomain, reason }) => {
  // action('LOADER_REQUEST_DATA')(id, reason);
  if (reason === 'MOUNTED') {
    // Create dataset on mount
    return {
      data: randomData({ baseDomain, n: 25 }),
    };
  }
  if (reason === 'INTERVAL') {
    let splicingIndex = 0;
    for (let i = 0; i < oldSeries.data; i += 1) {
      if (oldSeries.data[i] >= baseDomain[0]) {
        splicingIndex = i - 1;
        break;
      }
    }
    return Math.random() < 0.05
      ? {
          data: [
            ...oldSeries.data.slice(splicingIndex),
            { timestamp: Date.now(), value: Math.random() },
          ],
        }
      : oldSeries;
  }
  // Otherwise, return the existing dataset.
  return {
    data: oldSeries.data,
  };
};

const customAccessorLoader = ({ baseDomain, oldSeries, reason }) => {
  if (reason === 'MOUNTED') {
    return {
      data: randomData({ baseDomain }).map(d => [d.timestamp, d.value]),
    };
  }
  return {
    data: oldSeries.data,
  };
};

const staticBaseDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const liveBaseDomain = [Date.now() - 1000 * 30, Date.now()];
const CHART_HEIGHT = 500;

/* eslint-disable react/no-multi-comp */
storiesOf('LineChart', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add(
    'Basic',
    withInfo()(() => (
      <DataProvider
        defaultLoader={staticLoader}
        baseDomain={staticBaseDomain}
        series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
      >
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
    ))
  )
  .add(
    'Multiple',
    withInfo()(() => (
      <React.Fragment>
        <DataProvider
          defaultLoader={staticLoader}
          baseDomain={staticBaseDomain}
          series={[
            { id: 1, color: 'steelblue' },
            { id: 2, color: 'maroon' },
            { id: 3, color: 'orange' },
          ]}
        >
          <LineChart height={CHART_HEIGHT} />
        </DataProvider>
        <DataProvider
          defaultLoader={staticLoader}
          baseDomain={staticBaseDomain}
          series={[
            { id: 1, color: 'steelblue' },
            { id: 2, color: 'maroon' },
            { id: 3, color: 'orange', hidden: true },
          ]}
        >
          <LineChart height={CHART_HEIGHT} />
        </DataProvider>
        <DataProvider
          defaultLoader={staticLoader}
          baseDomain={staticBaseDomain}
          series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
        >
          <LineChart height={CHART_HEIGHT} />
        </DataProvider>
      </React.Fragment>
    ))
  )
  .add(
    'Single-value in y axis',
    withInfo()(() => (
      <React.Fragment>
        <DataProvider
          baseDomain={staticBaseDomain}
          series={[
            { id: 1, color: 'steelblue', loader: monoLoader(0) },
            { id: 2, color: 'maroon', loader: monoLoader(0.5) },
            { id: 3, color: 'orange', loader: monoLoader(-0.5) },
          ]}
        >
          <LineChart height={CHART_HEIGHT} />
        </DataProvider>
      </React.Fragment>
    ))
  )
  .add(
    'Sized',
    withInfo()(() => (
      <div>
        <p>All of the components should be entirely contained in the red box</p>
        <div
          style={{
            width: `${CHART_HEIGHT}px`,
            height: `${CHART_HEIGHT}px`,
            border: '2px solid red',
          }}
        >
          <DataProvider
            defaultLoader={staticLoader}
            baseDomain={staticBaseDomain}
            series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
          >
            <LineChart height={CHART_HEIGHT} width={CHART_HEIGHT} />
          </DataProvider>
        </div>
      </div>
    ))
  )
  .add(
    'Resizing',
    withInfo()(() => {
      class ResizingChart extends React.Component {
        state = { width: CHART_HEIGHT, height: CHART_HEIGHT };

        toggleHide = key => {
          const { hiddenSeries } = this.state;
          this.setState({
            hiddenSeries: {
              ...hiddenSeries,
              [key]: !hiddenSeries[key],
            },
          });
        };

        render() {
          const { width, height } = this.state;
          const nextWidth =
            width === CHART_HEIGHT ? CHART_HEIGHT * 2 : CHART_HEIGHT;
          const nextHeight =
            height === CHART_HEIGHT ? CHART_HEIGHT * 2 : CHART_HEIGHT;
          return (
            <React.Fragment>
              <p>
                All of the components should be entirely contained in the red
                box
              </p>
              <button onClick={() => this.setState({ width: nextWidth })}>
                change to {nextWidth} pixels wide
              </button>
              <button onClick={() => this.setState({ height: nextHeight })}>
                change to {nextHeight} pixels high
              </button>
              <div
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  border: '2px solid red',
                }}
              >
                <DataProvider
                  defaultLoader={staticLoader}
                  baseDomain={staticBaseDomain}
                  series={[
                    { id: 1, color: 'steelblue' },
                    { id: 2, color: 'maroon' },
                  ]}
                >
                  <LineChart height={height} width={width} />
                </DataProvider>
              </div>
            </React.Fragment>
          );
        }
      }
      return <ResizingChart />;
    })
  )
  .add(
    'Custom default accessors',
    withInfo()(() => (
      <DataProvider
        defaultLoader={customAccessorLoader}
        xAccessor={d => d[0]}
        yAccessor={d => d[1]}
        baseDomain={staticBaseDomain}
        series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
      >
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
    ))
  )
  .add(
    'min/max',
    withInfo()(() => {
      const y0Accessor = d => d[1] - 0.5;
      const y1Accessor = d => d[1] + 0.5;
      return (
        <DataProvider
          defaultLoader={customAccessorLoader}
          xAccessor={d => d[0]}
          yAccessor={d => d[1]}
          baseDomain={staticBaseDomain}
          series={[
            { id: 10, color: 'steelblue', y0Accessor, y1Accessor },
            { id: 2, color: 'maroon' },
          ]}
        >
          <LineChart height={CHART_HEIGHT} />
        </DataProvider>
      );
    })
  )
  .add(
    'min/max (step series)',
    withInfo()(() => {
      const y0Accessor = d => d[1] - 0.5;
      const y1Accessor = d => d[1] + 0.5;
      return (
        <DataProvider
          defaultLoader={customAccessorLoader}
          baseDomain={staticBaseDomain}
          xAccessor={d => d[0]}
          yAccessor={d => d[1]}
          series={[
            { id: 10, color: 'steelblue', y0Accessor, y1Accessor, step: true },
            { id: 2, color: 'maroon', step: true },
          ]}
        >
          <LineChart height={CHART_HEIGHT} />
        </DataProvider>
      );
    })
  )
  .add(
    'Loading data from api',
    withInfo()(() => (
      <DataProvider
        defaultLoader={quandlLoader}
        baseDomain={[+moment().subtract(10, 'year'), +moment()]}
        series={[
          {
            id: 'COM/COFFEE_BRZL',
            color: 'steelblue',
          },
          {
            id: 'COM/COFFEE_CLMB',
            color: 'red',
          },
        ]}
        pointsPerSeries={100}
      >
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
    ))
  )
  .add(
    'Hide series',
    withInfo()(() => {
      class HiddenSeries extends React.Component {
        state = { hiddenSeries: {} };

        toggleHide = key => {
          const { hiddenSeries } = this.state;
          this.setState({
            hiddenSeries: {
              ...hiddenSeries,
              [key]: !hiddenSeries[key],
            },
          });
        };

        render() {
          const { hiddenSeries } = this.state;
          return (
            <React.Fragment>
              <DataProvider
                defaultLoader={staticLoader}
                baseDomain={staticBaseDomain}
                series={[
                  {
                    id: 1,
                    color: 'steelblue',
                    hidden: hiddenSeries[1],
                  },
                  {
                    id: 2,
                    color: 'maroon',
                    hidden: hiddenSeries[2],
                  },
                ]}
              >
                <LineChart height={CHART_HEIGHT} />
              </DataProvider>
              <button onClick={() => this.toggleHide(1)}>Hide series 1</button>
              <button onClick={() => this.toggleHide(2)}>Hide series 2</button>
            </React.Fragment>
          );
        }
      }
      return <HiddenSeries />;
    })
  )
  .add(
    'Specify y domain',
    withInfo()(() => {
      const staticDomain = [-2, 2];
      class SpecifyDomain extends React.Component {
        state = { yDomains: {} };

        setStaticDomain = key => {
          const { yDomains } = this.state;
          if (yDomains[key]) {
            const newYDomains = { ...yDomains };
            delete newYDomains[key];
            this.setState({ yDomains: newYDomains });
            action(`Removing static domain`)(key);
            return;
          }
          action(`Setting domain to DataProvider`)(key);
          this.setState({ yDomains: { ...yDomains, [key]: staticDomain } });
        };

        render() {
          const { yDomains } = this.state;
          return (
            <React.Fragment>
              <DataProvider
                defaultLoader={staticLoader}
                baseDomain={staticBaseDomain}
                series={[
                  { id: 1, color: 'steelblue', yDomain: yDomains[1] },
                  { id: 2, color: 'maroon', yDomain: yDomains[2] },
                ]}
              >
                <LineChart height={CHART_HEIGHT} />
              </DataProvider>
              <button onClick={() => this.setStaticDomain(1)}>
                Static series 1
              </button>
              <button onClick={() => this.setStaticDomain(2)}>
                Static series 2
              </button>
            </React.Fragment>
          );
        }
      }
      return <SpecifyDomain />;
    })
  )
  .add(
    'Annotations',
    withInfo()(() => {
      const series = staticLoader({
        id: 1,
        reason: 'MOUNTED',
      }).data;
      const exampleAnnotations = [
        {
          id: 1,
          data: [series[40].timestamp, series[60].timestamp],
          color: 'black',
        },
      ];
      return (
        <DataProvider
          defaultLoader={staticLoader}
          baseDomain={staticBaseDomain}
          series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
        >
          <LineChart height={CHART_HEIGHT} annotations={exampleAnnotations} />
        </DataProvider>
      );
    })
  )
  .add(
    'Click events',
    withInfo()(() => {
      const series = staticLoader({
        id: 1,
        reason: 'MOUNTED',
      }).data;
      const exampleAnnotations = [
        {
          id: 1,
          data: [series[40].timestamp, series[60].timestamp],
          color: 'black',
        },
      ];
      return (
        <DataProvider
          defaultLoader={staticLoader}
          baseDomain={staticBaseDomain}
          series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
        >
          <LineChart
            height={CHART_HEIGHT}
            annotations={exampleAnnotations}
            onClickAnnotation={annotation => {
              action('annotation click')(annotation);
            }}
            onClick={e => {
              action('chart click')(e);
            }}
          />
        </DataProvider>
      );
    })
  )
  .add(
    'Draw points',
    withInfo()(() => (
      <DataProvider
        defaultLoader={staticLoader}
        baseDomain={staticBaseDomain}
        pointsPerSeries={100}
        series={[
          { id: 1, color: 'steelblue' },
          { id: 2, color: 'maroon', drawPoints: true },
        ]}
      >
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
    ))
  )
  .add(
    'Without context chart',
    withInfo()(() => (
      <DataProvider
        defaultLoader={staticLoader}
        baseDomain={staticBaseDomain}
        series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
      >
        <LineChart height={CHART_HEIGHT} contextChart={{ visible: false }} />
      </DataProvider>
    ))
  )
  .add(
    'Non-Zoomable',
    withInfo()(() => {
      class ZoomToggle extends React.Component {
        state = {
          zoomable: true,
          yZoomable: { 1: false, 2: false },
        };

        toggleZoom = id => {
          action('zoomed')(`${id} - ${!this.state.yZoomable[id]}`);
          this.setState({
            yZoomable: {
              ...this.state.yZoomable,
              [id]: !this.state.yZoomable[id],
            },
          });
        };

        render() {
          const { zoomable, yZoomable } = this.state;
          return (
            <React.Fragment>
              <DataProvider
                defaultLoader={staticLoader}
                baseDomain={staticBaseDomain}
                series={[
                  { id: 1, color: 'steelblue', zoomable: yZoomable[1] },
                  { id: 2, color: 'maroon', zoomable: yZoomable[2] },
                ]}
              >
                <LineChart height={CHART_HEIGHT} zoomable={zoomable} />
              </DataProvider>
              <button
                onClick={() =>
                  this.setState({ zoomable: !this.state.zoomable })
                }
              >
                Toggle x zoom [{zoomable ? 'on' : 'off'}]
              </button>
              <button onClick={() => this.toggleZoom(1)}>
                Toggle y1 zoom [{yZoomable[1] !== false ? 'on' : 'off'}]
              </button>
              <button onClick={() => this.toggleZoom(2)}>
                Toggle y2 zoom [{yZoomable[2] !== false ? 'on' : 'off'}]
              </button>
            </React.Fragment>
          );
        }
      }
      return <ZoomToggle />;
    })
  )
  .add(
    'Dynamic base domain',
    withInfo()(() => {
      class DynamicBaseDomain extends React.Component {
        state = {
          baseDomain: staticBaseDomain,
        };

        toggleBaseDomain = () => {
          const { baseDomain } = this.state;
          const newDomain = isEqual(baseDomain, staticBaseDomain)
            ? [
                staticBaseDomain[0] - 100000000 * 50,
                staticBaseDomain[1] + 100000000 * 50,
              ]
            : staticBaseDomain;
          this.setState({ baseDomain: newDomain });
        };

        render() {
          const { baseDomain } = this.state;
          return (
            <div>
              <button onClick={this.toggleBaseDomain}>
                {isEqual(baseDomain, staticBaseDomain)
                  ? 'Shrink baseDomain'
                  : 'Reset base domain'}
              </button>
              <DataProvider
                defaultLoader={staticLoader}
                series={[
                  { id: 1, color: 'steelblue' },
                  { id: 2, color: 'maroon' },
                ]}
                baseDomain={baseDomain}
              >
                <LineChart height={CHART_HEIGHT} />
              </DataProvider>
            </div>
          );
        }
      }
      return <DynamicBaseDomain />;
    })
  )
  .add(
    'Dynamic sub domain',
    withInfo()(() => {
      const subDomainFirst = [
        Date.now() - 1000 * 60 * 60 * 24 * 20,
        Date.now() - 1000 * 60 * 60 * 24 * 10,
      ];

      const subDomainSecond = [
        Date.now() - 1000 * 60 * 60 * 24 * 10,
        Date.now(),
      ];

      class CustomSubDomain extends React.Component {
        state = {
          isFirst: true,
        };

        render() {
          return (
            <React.Fragment>
              <button
                onClick={() => this.setState({ isFirst: !this.state.isFirst })}
              >
                {this.state.isFirst
                  ? `Switch subDomain`
                  : `Switch back subDomain`}
              </button>
              <DataProvider
                defaultLoader={staticLoader}
                baseDomain={staticBaseDomain}
                subDomain={
                  this.state.isFirst ? subDomainFirst : subDomainSecond
                }
                series={[
                  { id: 1, color: 'steelblue' },
                  { id: 2, color: 'maroon' },
                ]}
              >
                <LineChart height={CHART_HEIGHT} />
              </DataProvider>
            </React.Fragment>
          );
        }
      }
      return <CustomSubDomain />;
    })
  )
  .add(
    'Live loading',
    withInfo()(() => (
      <DataProvider
        defaultLoader={liveLoader}
        baseDomain={liveBaseDomain}
        updateInterval={33}
        yAxisWidth={50}
        series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
      >
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
    ))
  )
  .add(
    'Live loading and ruler',
    withInfo()(() => (
      <DataProvider
        defaultLoader={liveLoader}
        baseDomain={liveBaseDomain}
        updateInterval={33}
        yAxisWidth={50}
        series={[
          { id: 1, color: 'steelblue', name: 'name1' },
          { id: 2, color: 'maroon', name: 'name2' },
        ]}
      >
        <LineChart
          height={CHART_HEIGHT}
          crosshair={false}
          ruler={{
            visible: true,
            yLabel: point =>
              `${point.name}: ${Number.parseFloat(point.value).toFixed(3)}`,
            xLabel: point =>
              moment(point.timestamp).format('DD-MM-YYYY HH:mm:ss'),
          }}
        />
      </DataProvider>
    ))
  )
  .add(
    'Enable/disable series',
    withInfo()(() => {
      const colors = {
        'COM/COFFEE_BRZL': 'steelblue',
        'COM/COFFEE_CLMB': 'maroon',
      };
      const options = [
        { value: 'COM/COFFEE_BRZL', label: 'Brazil coffe price' },
        { value: 'COM/COFFEE_CLMB', label: 'Columbia coffe price' },
      ];

      const baseDomain = [+moment().subtract(10, 'year'), +moment()];

      // eslint-disable-next-line
      class EnableDisableSeries extends React.Component {
        state = {
          series: [options[0]],
        };

        onChangeSeries = series => this.setState({ series });

        render() {
          const { series } = this.state;
          return (
            <React.Fragment>
              <Select
                multi
                value={series}
                options={options}
                onChange={this.onChangeSeries}
                style={{ marginBottom: '15px' }}
              />
              <DataProvider
                defaultLoader={quandlLoader}
                pointsPerSeries={100}
                baseDomain={baseDomain}
                series={series.map(s => ({
                  id: s.value,
                  color: colors[s.value],
                }))}
              >
                <LineChart height={CHART_HEIGHT} />
              </DataProvider>
            </React.Fragment>
          );
        }
      }
      return <EnableDisableSeries />;
    })
  )
  .add(
    'Custom context brush',
    withInfo()(() => {
      const width = 600;
      const height = 50;
      // eslint-disable-next-line
      class BrushComponent extends React.Component {
        state = {
          selection: [0, width],
        };

        onUpdateSelection = selection => {
          this.setState({
            selection,
          });
        };

        render() {
          const { selection } = this.state;
          return (
            <div>
              <svg width={width} height={height} stroke="#777">
                <Brush
                  height={height}
                  width={width}
                  selection={selection}
                  onUpdateSelection={this.onUpdateSelection}
                />
              </svg>
              <p>width: {width}</p>
              <p>
                selection: [{selection[0]}, {selection[1]}]
              </p>
            </div>
          );
        }
      }
      return <BrushComponent />;
    })
  );

storiesOf('Y-Axis Modes', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add(
    'Mouse events',
    withInfo()(() => {
      // eslint-disable-next-line
      class MouseEvents extends React.Component {
        state = {
          series: [
            { id: 1, color: 'steelblue' },
            { id: 2, color: 'maroon' },
            { id: 3, color: 'orange' },
            { id: 4, color: 'green' },
          ],
        };

        mouseEvent = (e, seriesId) => {
          action('Axis mouse event')(e.type, seriesId);
        };

        render() {
          const { series, yAxisDisplayMode } = this.state;
          return (
            <React.Fragment>
              <DataProvider
                defaultLoader={staticLoader}
                baseDomain={staticBaseDomain}
                series={series}
              >
                <LineChart
                  height={CHART_HEIGHT}
                  yAxisDisplayMode={yAxisDisplayMode}
                  onAxisMouseEnter={this.mouseEvent}
                  onAxisMouseLeave={this.mouseEvent}
                />
              </DataProvider>
            </React.Fragment>
          );
        }
      }
      return <MouseEvents />;
    })
  )
  .add(
    'Without y axis',
    withInfo()(() => (
      <DataProvider
        defaultLoader={staticLoader}
        baseDomain={staticBaseDomain}
        series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
      >
        <LineChart
          height={CHART_HEIGHT}
          yAxisDisplayMode={AxisDisplayMode.NONE}
        />
      </DataProvider>
    ))
  )
  .add(
    'Collapsed y axis',
    withInfo()(() => (
      <DataProvider
        defaultLoader={staticLoader}
        baseDomain={staticBaseDomain}
        series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
      >
        <LineChart
          height={CHART_HEIGHT}
          yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
        />
      </DataProvider>
    ))
  )
  .add(
    'Some hidden',
    withInfo()(() => {
      // eslint-disable-next-line
      class SomeCollapsed extends React.Component {
        state = {
          yAxisDisplayMode: AxisDisplayMode.ALL,
        };

        render() {
          const { yAxisDisplayMode } = this.state;
          return (
            <React.Fragment>
              <DataProvider
                defaultLoader={staticLoader}
                baseDomain={staticBaseDomain}
                series={[
                  {
                    id: 1,
                    color: 'steelblue',
                    yAxisDisplayMode: AxisDisplayMode.NONE,
                  },
                  { id: 2, color: 'maroon' },
                  {
                    id: 3,
                    color: 'orange',
                    yAxisDisplayMode: AxisDisplayMode.NONE,
                  },
                  { id: 4, color: 'green' },
                ]}
              >
                <LineChart
                  height={CHART_HEIGHT}
                  yAxisDisplayMode={yAxisDisplayMode}
                />
              </DataProvider>
              <button
                onClick={() =>
                  this.setState({
                    yAxisDisplayMode: AxisDisplayMode.ALL,
                  })
                }
              >
                ALL
              </button>
              <button
                onClick={() =>
                  this.setState({
                    yAxisDisplayMode: AxisDisplayMode.NONE,
                  })
                }
              >
                NONE
              </button>
              <button
                onClick={() =>
                  this.setState({
                    yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
                  })
                }
              >
                COLLAPSED
              </button>
            </React.Fragment>
          );
        }
      }
      return <SomeCollapsed />;
    })
  )
  .add(
    'Some collapsed',
    withInfo()(() => {
      // eslint-disable-next-line
      class SomeCollapsed extends React.Component {
        state = {
          yAxisDisplayMode: AxisDisplayMode.ALL,
        };

        render() {
          const { yAxisDisplayMode } = this.state;
          return (
            <React.Fragment>
              <DataProvider
                defaultLoader={staticLoader}
                baseDomain={staticBaseDomain}
                series={[
                  {
                    id: 1,
                    color: 'steelblue',
                    yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
                  },
                  { id: 2, color: 'maroon' },
                  {
                    id: 3,
                    color: 'orange',
                    yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
                  },
                  { id: 4, color: 'green' },
                ]}
              >
                <LineChart
                  height={CHART_HEIGHT}
                  yAxisDisplayMode={yAxisDisplayMode}
                />
              </DataProvider>
            </React.Fragment>
          );
        }
      }
      return <SomeCollapsed />;
    })
  )
  .add(
    'Some collapsed (until hover)',
    withInfo()(() => {
      // eslint-disable-next-line
      class SomeCollapsed extends React.Component {
        state = {
          yAxisDisplayMode: AxisDisplayMode.ALL,
          series: [
            {
              id: 1,
              color: 'steelblue',
              yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
            },
            { id: 2, color: 'maroon' },
            {
              id: 3,
              color: 'orange',
              yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
            },
            { id: 4, color: 'green' },
          ],
        };

        expandAll = (e, seriesId) => {
          if (seriesId === 'collapsed') {
            const series = this.state.series.map(s => ({
              ...s,
              yAxisDisplayMode: AxisDisplayMode.ALL,
            }));
            this.setState({
              series,
            });
          }
          if (this.collapseTimer) {
            clearTimeout(this.collapseTimer);
          }
        };

        collapseSome = () => {
          this.collapseTimer = setTimeout(() => {
            const series = this.state.series.map(s => ({
              ...s,
              yAxisDisplayMode:
                s.id === 1 || s.id === 3
                  ? AxisDisplayMode.COLLAPSED
                  : AxisDisplayMode.ALL,
            }));
            this.setState({
              series,
            });
          }, 50);
        };

        render() {
          const { series, yAxisDisplayMode } = this.state;
          return (
            <React.Fragment>
              <DataProvider
                defaultLoader={staticLoader}
                baseDomain={staticBaseDomain}
                series={series}
              >
                <LineChart
                  height={CHART_HEIGHT}
                  yAxisDisplayMode={yAxisDisplayMode}
                  onAxisMouseEnter={this.expandAll}
                  onAxisMouseLeave={this.collapseSome}
                />
              </DataProvider>
            </React.Fragment>
          );
        }
      }
      return <SomeCollapsed />;
    })
  )
  .add(
    'AxisCollection modes (button)',
    withInfo()(() => {
      // eslint-disable-next-line
      class ExpandCollapse extends React.Component {
        state = {
          yAxisDisplayMode: AxisDisplayMode.ALL,
        };

        render() {
          const { yAxisDisplayMode } = this.state;
          return (
            <React.Fragment>
              <DataProvider
                defaultLoader={staticLoader}
                baseDomain={staticBaseDomain}
                series={[
                  { id: 1, color: 'steelblue' },
                  { id: 2, color: 'maroon' },
                ]}
              >
                <LineChart
                  height={CHART_HEIGHT}
                  yAxisDisplayMode={yAxisDisplayMode}
                />
              </DataProvider>
              <button
                onClick={() =>
                  this.setState({
                    yAxisDisplayMode: AxisDisplayMode.ALL,
                  })
                }
              >
                ALL
              </button>
              <button
                onClick={() =>
                  this.setState({
                    yAxisDisplayMode: AxisDisplayMode.NONE,
                  })
                }
              >
                NONE
              </button>
              <button
                onClick={() =>
                  this.setState({
                    yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
                  })
                }
              >
                COLLAPSED
              </button>
            </React.Fragment>
          );
        }
      }
      return <ExpandCollapse />;
    })
  )
  .add(
    'AxisCollection modes (hover)',
    withInfo()(() => {
      // eslint-disable-next-line
      class ExpandCollapse extends React.Component {
        state = {
          yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
        };

        expand = () => {
          this.setState({
            yAxisDisplayMode: AxisDisplayMode.ALL,
          });
          if (this.collapseTimer) {
            clearTimeout(this.collapseTimer);
          }
        };

        collapse = () => {
          this.collapseTimer = setTimeout(() => {
            this.setState({
              yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
            });
          }, 50);
        };

        render() {
          const { yAxisDisplayMode } = this.state;
          return (
            <React.Fragment>
              <DataProvider
                defaultLoader={staticLoader}
                baseDomain={staticBaseDomain}
                series={[
                  { id: 1, color: 'steelblue' },
                  { id: 2, color: 'maroon' },
                ]}
              >
                <LineChart
                  height={CHART_HEIGHT}
                  yAxisDisplayMode={yAxisDisplayMode}
                  onAxisMouseEnter={this.expand}
                  onAxisMouseLeave={this.collapse}
                />
              </DataProvider>
            </React.Fragment>
          );
        }
      }
      return <ExpandCollapse />;
    })
  );

storiesOf('InteractionLayer', module)
  .add(
    'Ruler',
    withInfo()(() => (
      <DataProvider
        baseDomain={staticBaseDomain}
        defaultLoader={staticLoader}
        xAccessor={d => d.timestamp}
        yAccessor={d => d.value}
        series={[
          { id: 1, color: 'steelblue', name: 'name1' },
          { id: 2, color: 'maroon', name: 'name2' },
        ]}
      >
        <LineChart
          height={CHART_HEIGHT}
          crosshair={false}
          ruler={{
            visible: true,
            yLabel: point =>
              `${point.name}: ${Number.parseFloat(point.value).toFixed(3)}`,
            xLabel: point =>
              moment(point.timestamp).format('DD-MM-YYYY HH:mm:ss'),
          }}
        />
      </DataProvider>
    ))
  )
  .add(
    'Area (no zoom)',
    withInfo()(() => (
      <DataProvider
        defaultLoader={staticLoader}
        baseDomain={staticBaseDomain}
        series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
      >
        <LineChart
          height={CHART_HEIGHT}
          onAreaDefined={area => {
            action('Area defined')(area);
          }}
        />
      </DataProvider>
    ))
  )
  .add(
    'Area (zoom)',
    withInfo()(() => {
      class ZoomByArea extends React.Component {
        state = { subDomain: null };

        onAreaDefined = area => {
          const { start, end } = area;
          const subDomain = [
            start.points[0].timestamp,
            end.points[0].timestamp,
          ];
          this.setState({
            subDomain,
          });
          action('New subdomain')(subDomain);
        };

        render() {
          const { subDomain } = this.state;
          return (
            <DataProvider
              defaultLoader={staticLoader}
              baseDomain={staticBaseDomain}
              subDomain={subDomain}
              series={[
                { id: 1, color: 'steelblue' },
                { id: 2, color: 'maroon' },
              ]}
            >
              <LineChart
                height={CHART_HEIGHT}
                onAreaDefined={this.onAreaDefined}
              />
            </DataProvider>
          );
        }
      }
      return <ZoomByArea />;
    })
  )
  .add(
    'Area (hold shift to enable)',
    withInfo()(() => {
      // eslint-disable-next-line
      class OnDemandArea extends React.Component {
        state = { enableArea: false };

        componentDidMount() {
          d3.select('body').on('keydown', this.onKeyDown);
          d3.select('body').on('keyup', this.onKeyUp);
        }

        onAreaDefined = area => {
          action('Area defined')(area);
        };

        onKeyDown = () => {
          const code = d3.event.keyCode;
          if (code === 16) {
            // SHIFT
            this.setState({ enableArea: true });
          }
        };

        onKeyUp = () => {
          const code = d3.event.keyCode;
          if (code === 16) {
            // SHIFT
            this.setState({ enableArea: false });
          }
        };

        render() {
          const { enableArea } = this.state;
          return (
            <React.Fragment>
              <DataProvider
                defaultLoader={staticLoader}
                baseDomain={staticBaseDomain}
                series={[
                  { id: 1, color: 'steelblue' },
                  { id: 2, color: 'maroon' },
                ]}
              >
                <LineChart
                  height={CHART_HEIGHT}
                  onAreaDefined={enableArea ? this.onAreaDefined : null}
                />
              </DataProvider>
              (You might need to click here first)
            </React.Fragment>
          );
        }
      }
      return <OnDemandArea />;
    })
  )
  .add(
    'Persistent fixed area (hold shift to enable)',
    withInfo()(() => {
      // eslint-disable-next-line
      class OnDemandArea extends React.Component {
        state = { enableArea: false, area: undefined };

        componentDidMount() {
          d3.select('body').on('keydown', this.onKeyDown);
          d3.select('body').on('keyup', this.onKeyUp);
        }

        onAreaDefined = area => {
          this.setState({
            area,
          });
        };

        onKeyDown = () => {
          const code = d3.event.keyCode;
          if (code === 16) {
            // SHIFT
            this.setState({ enableArea: true });
          }
        };

        onKeyUp = () => {
          const code = d3.event.keyCode;
          if (code === 16) {
            // SHIFT
            this.setState({ enableArea: false });
          }
        };

        render() {
          const { enableArea, area } = this.state;
          return (
            <React.Fragment>
              <DataProvider
                defaultLoader={staticLoader}
                baseDomain={staticBaseDomain}
                series={[
                  { id: 1, color: 'steelblue' },
                  { id: 2, color: 'maroon' },
                ]}
              >
                <LineChart
                  height={CHART_HEIGHT}
                  areas={area ? [area] : []}
                  onAreaDefined={enableArea ? this.onAreaDefined : null}
                />
              </DataProvider>
              (You might need to click here first)
            </React.Fragment>
          );
        }
      }
      return <OnDemandArea />;
    })
  )
  .add(
    'Persistent fixed areas (click to remove)',
    withInfo()(() => {
      // eslint-disable-next-line
      class OnDemandArea extends React.Component {
        state = { areas: [] };

        onAreaDefined = area => {
          const { areas } = this.state;
          this.setState({
            areas: [...areas, area],
          });
        };

        onAreaClicked = (area, xpos, ypos) => {
          action('Area clicked')(area, xpos, ypos);
          this.setState({
            areas: this.state.areas.filter(a => a.id !== area.id),
          });
          return true;
        };

        render() {
          const { areas } = this.state;
          return (
            <React.Fragment>
              <DataProvider
                defaultLoader={staticLoader}
                baseDomain={staticBaseDomain}
                series={[
                  { id: 1, color: 'steelblue' },
                  { id: 2, color: 'maroon' },
                ]}
              >
                <LineChart
                  height={CHART_HEIGHT}
                  areas={areas}
                  onAreaDefined={this.onAreaDefined}
                  onAreaClicked={this.onAreaClicked}
                />
              </DataProvider>
              (You might need to click here first)
            </React.Fragment>
          );
        }
      }
      return <OnDemandArea />;
    })
  )
  .add(
    'Persistent fixed areas (click outside to clear)',
    withInfo()(() => {
      // eslint-disable-next-line
      class OnDemandArea extends React.Component {
        state = { areas: [] };

        onAreaDefined = area => {
          const { areas } = this.state;
          this.setState({
            areas: [...areas, area],
          });
        };

        onAreaClicked = (area, xpos, ypos) => {
          action('Area clicked')(area, xpos, ypos);
        };

        onChartClicked = () => {
          this.setState({
            areas: [],
          });
        };

        render() {
          const { areas } = this.state;
          return (
            <React.Fragment>
              <DataProvider
                defaultLoader={staticLoader}
                baseDomain={staticBaseDomain}
                series={[
                  { id: 1, color: 'steelblue' },
                  { id: 2, color: 'maroon' },
                ]}
              >
                <LineChart
                  height={CHART_HEIGHT}
                  areas={areas}
                  onAreaDefined={this.onAreaDefined}
                  onAreaClicked={this.onAreaClicked}
                  onClick={this.onChartClicked}
                />
              </DataProvider>
              (You might need to click here first)
            </React.Fragment>
          );
        }
      }
      return <OnDemandArea />;
    })
  )
  .add(
    'Persistent series area (hold shift to enable)',
    withInfo()(() => {
      // eslint-disable-next-line
      class OnDemandArea extends React.Component {
        state = { enableArea: false, areas: [] };

        componentDidMount() {
          d3.select('body').on('keydown', this.onKeyDown);
          d3.select('body').on('keyup', this.onKeyUp);
        }

        onAreaDefined = area => {
          const newAreas = [...this.state.areas];
          for (let i = 0; i < area.start.points.length; i += 1) {
            const newArea = {
              seriesId: area.start.points[i].id,
              start: {
                ...area.start,
                xval: area.start.points[i].timestamp,
                yval: area.start.points[i].value,
              },
              end: {
                ...area.end,
                xval: area.end.points[i].timestamp,
                yval: area.end.points[i].value,
              },
            };
            newAreas.push(newArea);
          }
          this.setState({
            areas: newAreas,
          });
        };

        onKeyDown = () => {
          const code = d3.event.keyCode;
          if (code === 16) {
            // SHIFT
            this.setState({ enableArea: true });
          }
        };

        onKeyUp = () => {
          const code = d3.event.keyCode;
          if (code === 16) {
            // SHIFT
            this.setState({ enableArea: false });
          }
        };

        render() {
          const { enableArea, areas } = this.state;
          return (
            <React.Fragment>
              <DataProvider
                defaultLoader={staticLoader}
                baseDomain={staticBaseDomain}
                series={[
                  { id: 1, color: 'steelblue' },
                  { id: 2, color: 'maroon' },
                ]}
              >
                <LineChart
                  height={CHART_HEIGHT}
                  areas={areas}
                  onAreaDefined={enableArea ? this.onAreaDefined : null}
                />
              </DataProvider>
              (You might need to click here first)
            </React.Fragment>
          );
        }
      }
      return <OnDemandArea />;
    })
  )
  .add(
    'Regression: onMouseUp',
    withInfo()(() => {
      // eslint-disable-next-line
      class OnMouseUp extends React.Component {
        state = { onAreaDefined: null };

        componentDidMount() {
          window.setInterval(this.toggleOnAreaDefined, 1000);
        }

        toggleOnAreaDefined = () => {
          this.setState({
            onAreaDefined: this.state.onAreaDefined ? null : console.log,
          });
        };

        render() {
          const { onAreaDefined } = this.state;
          return (
            <React.Fragment>
              <DataProvider
                defaultLoader={staticLoader}
                baseDomain={staticBaseDomain}
                series={[
                  { id: 1, color: 'steelblue' },
                  { id: 2, color: 'maroon' },
                ]}
              >
                <LineChart
                  height={CHART_HEIGHT}
                  onAreaDefined={onAreaDefined}
                />
              </DataProvider>
              onAreaDefined={onAreaDefined ? 'function' : 'null'}
              <h2>Test</h2>
              <ol>
                <li>
                  Press and hold when <strong>onAreaDefined</strong> says{' '}
                  <strong>function</strong>
                </li>
                <li>
                  Continue holding when it switches to <strong>null</strong>
                </li>
                <li>
                  Release when it says <strong>function</strong> again
                </li>
                <li>Check that there are no errors in the console</li>
              </ol>
            </React.Fragment>
          );
        }
      }
      return <OnMouseUp />;
    })
  );

const mapping = {
  '1 2': { x: 1, y: 2 },
  '2 3': { x: 2, y: 3 },
  '3 4': { x: 3, y: 4 },
  '4 5': { x: 4, y: 5 },
  '5 6': { x: 5, y: 6 },
  '6 7': { x: 6, y: 7 },
  '7 8': { x: 7, y: 8 },
  '8 9': { x: 8, y: 9 },
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
  .add(
    'Scatterplot (one series)',
    withInfo()(() => (
      <DataProvider
        defaultLoader={scatterplotloader}
        baseDomain={[0, 1]}
        series={[{ id: '1 2', color: 'steelblue' }]}
        xAccessor={d => +d.x}
        yAccessor={d => +d.y}
      >
        <Scatterplot height={500} width={500} zoomable />
      </DataProvider>
    ))
  )
  .add(
    'Scatterplot (many pairs)',
    withInfo()(() => (
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
        <Scatterplot height={500} width={500} zoomable />
      </DataProvider>
    ))
  )
  .add(
    'Scatterplot (stroke width)',
    withInfo()(() => (
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
        <Scatterplot height={500} width={500} zoomable />
      </DataProvider>
    ))
  );
