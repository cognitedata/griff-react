import React from 'react';
import * as d3 from 'd3';
import moment from 'moment';
import Select from 'react-select';
import isEqual from 'lodash.isequal';
import 'react-select/dist/react-select.css';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withInfo } from '@storybook/addon-info';
import { DataProvider, LineChart } from '../src';
import quandlLoader from './quandlLoader';

const randomData = (dt = 100000000, n = 250) => {
  const data = [];
  for (let i = n; i > 0; i -= 1) {
    const timestamp = Date.now() - i * dt;
    const value = Math.random();
    data.push({
      timestamp,
      value,
    });
  }
  return data;
};

const staticLoader = ({ id, oldSeries, reason }) => {
  action('LOADER_REQUEST_DATA')(id, reason);
  if (reason === 'MOUNTED') {
    // Create dataset on mount
    return {
      data: randomData(),
    };
  }
  // Otherwise, return the existing dataset.
  return {
    data: oldSeries.data,
  };
};

const liveLoader = ({ id, oldSeries, baseDomain, reason }) => {
  action('LOADER_REQUEST_DATA')(id, reason);
  if (reason === 'MOUNTED') {
    // Create dataset on mount
    return {
      data: randomData(5000, 50),
    };
  }
  if (reason === 'INTERVAL') {
    return {
      data: [
        ...oldSeries.data,
        { timestamp: Date.now(), value: Math.random() },
      ],
    };
  }
  // Otherwise, return the existing dataset.
  return {
    data: oldSeries.data,
  };
};

const customAccessorLoader = ({ oldSeries, reason }) => {
  if (reason === 'MOUNTED') {
    return {
      data: randomData().map(d => [d.timestamp, d.value]),
    };
  }
  return {
    data: oldSeries.data,
  };
};

const staticBaseDomain = d3.extent(randomData(), d => d.timestamp);
const liveBaseDomain = d3.extent(randomData(5000, 50), d => d.timestamp);
const CHART_HEIGHT = 500;

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
      // eslint-disable-next-line
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
    'Without y axis',
    withInfo()(() => (
      <DataProvider
        defaultLoader={staticLoader}
        baseDomain={staticBaseDomain}
        yAxisWidth={0}
        series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
      >
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
    ))
  )
  .add(
    'Non-Zoomable',
    withInfo()(() => {
      // eslint-disable-next-line
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
      // eslint-disable-next-line
      class DynamicBaseDomain extends React.Component {
        state = {
          baseDomain: staticBaseDomain,
        };

        toggleBaseDomain = () => {
          const { baseDomain } = this.state;
          const newDomain = isEqual(baseDomain, staticBaseDomain)
            ? [
                staticBaseDomain[0] + 100000000 * 50,
                staticBaseDomain[1] - 100000000 * 50,
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
    'Live loading',
    withInfo()(() => (
      <DataProvider
        defaultLoader={liveLoader}
        baseDomain={liveBaseDomain}
        updateInterval={5000}
        yAxisWidth={50}
        series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
      >
        <LineChart height={CHART_HEIGHT} />
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
          series: options,
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
  );
