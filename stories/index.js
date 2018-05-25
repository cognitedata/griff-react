import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withInfo } from '@storybook/addon-info';
import moment from 'moment';
import * as d3 from 'd3';
import axios from 'axios';
import { DataProvider, LineChart } from '../src';

const randomData = () => {
  const data = [];
  for (let i = 250; i > 0; i -= 1) {
    const timestamp = Date.now() - i * 100000000;
    const value = Math.random();
    data.push({
      timestamp,
      value,
    });
  }
  return data;
};

const staticLoader = ({ oldSeries, reason }) => {
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
    withInfo()(() => {
      const calculateGranularity = (domain, pps) => {
        const diff = domain[1] - domain[0];

        if (diff / (1000 * 60 * 60 * 24) < pps) {
          // Can we show daily
          return 'daily';
        } else if (diff / (1000 * 60 * 60 * 24 * 7) < pps) {
          // Can we show weekly
          return 'weekly';
        } else if (diff / (1000 * 60 * 60 * 24 * 30) < pps) {
          // Can we show monthly
          return 'monthly';
        } else if (diff / (1000 * 60 * 60 * 24 * 30 * 3) < pps) {
          return 'quarterly';
        }
        return 'annualy';
      };
      const formatDate = date => moment(date).format('YYYY-MM-DD');
      const loader = async ({
        id,
        baseDomain,
        subDomain,
        pointsPerSeries,
        oldSeries,
        reason,
      }) => {
        const granularity = calculateGranularity(subDomain, pointsPerSeries);
        action(`Loader requested data. Reason: ${reason}`)(
          reason,
          baseDomain,
          subDomain,
          granularity
        );
        const result = await axios.get(
          `https://www.quandl.com/api/v3/${id}?start_date=${formatDate(
            subDomain[0]
          )}&end_date=${formatDate(
            subDomain[1]
          )}&order=asc&collapse=${granularity}&api_key=Yztsvxixwuz_NQz-8Ze3`
        );
        const { dataset } = result.data;
        let data = dataset.data.map(d => ({
          timestamp: +moment(d[0]),
          value: d[1],
        }));
        if (reason === 'UPDATE_SUBDOMAIN') {
          const oldData = [...oldSeries.data];
          if (oldData.length > 0) {
            const { xAccessor } = oldSeries;
            const firstPoint = xAccessor(data[0]);
            const lastPoint = xAccessor(data[data.length - 1]);
            let insertionStart = 0;
            let insertionEnd = oldData.length - 1;

            for (let idx = 1; idx < oldData.length; idx += 1) {
              if (xAccessor(oldData[idx]) > firstPoint) {
                insertionStart = idx - 1;
                break;
              }
            }
            for (let idx = oldData.length - 2; idx > 0; idx -= 1) {
              if (xAccessor(oldData[idx]) <= lastPoint) {
                insertionEnd = idx + 1;
                break;
              }
            }
            data = [
              ...oldData.slice(0, insertionStart),
              ...data,
              ...oldData.slice(insertionEnd),
            ];
          }
        }
        return { data, drawPoints: granularity === 'daily' };
      };
      return (
        <DataProvider
          defaultLoader={loader}
          baseDomain={[+moment().subtract(15, 'year'), +moment()]}
          series={[{ id: 'datasets/OPEC/ORB.json', color: 'steelblue' }]}
          pointsPerSeries={250}
        >
          <LineChart height={CHART_HEIGHT} />
        </DataProvider>
      );
    })
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
            yLabel: point =>
              `${point.name}: ${Number.parseFloat(point.value).toFixed(3)}`,
            xLabel: point =>
              moment(point.timestamp).format('DD-MM-YYYY HH:mm:ss'),
          }}
        />
      </DataProvider>
    ))
  );
