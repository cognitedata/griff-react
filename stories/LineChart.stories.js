import React from 'react';
import moment from 'moment';
import Select from 'react-select';
import isEqual from 'lodash.isequal';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { DataProvider, LineChart, Brush, Series } from '../build/src';
import quandlLoader from './quandlLoader';

import {
  staticLoader,
  monoLoader,
  customAccessorLoader,
  liveLoader,
} from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const liveXDomain = [Date.now() - 1000 * 30, Date.now()];
const CHART_HEIGHT = 500;

/* eslint-disable react/no-multi-comp */
storiesOf('LineChart', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('Basic', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[]}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Basic with yDomains', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[]}
    >
      <Series id="1" color="steelblue" ySubDomain={[0, 5]} />
      <Series id="2" color="maroon" ySubDomain={[-1, 1]} />
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Custom tick formatting', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[]}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart
        height={CHART_HEIGHT}
        xAxisFormatter={n => n / 1000}
        yAxisFormatter={n => n * 1000}
      />
    </DataProvider>
  ))
  .add('Custom # of y-axis ticks', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[]}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} yAxisTicks={15} />
    </DataProvider>
  ))
  .add('Multiple', () => (
    <React.Fragment>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        series={[]}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <Series id="3" color="orange" />
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        series={[]}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <Series id="3" color="orange" hidden />
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        series={[]}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
    </React.Fragment>
  ))
  .add('Single-value in y axis', () => (
    <React.Fragment>
      <DataProvider timeDomain={staticXDomain} series={[]}>
        <Series id="1" color="steelblue" loader={monoLoader(0)} />
        <Series id="2" color="maroon" loader={monoLoader(0.5)} />
        <Series id="3" color="orange" loader={monoLoader(-0.5)} />
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
    </React.Fragment>
  ))
  .add('Sized', () => (
    <div>
      <p>All of the components should be entirely contained in the red box</p>
      <div
        style={{
          width: `${CHART_HEIGHT}px`,
          height: `${CHART_HEIGHT}px`,
          border: '2px solid red',
          margin: '1em',
        }}
      >
        <DataProvider
          defaultLoader={staticLoader}
          timeDomain={staticXDomain}
          series={[]}
        >
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" />
          <LineChart />
        </DataProvider>
      </div>
      <div
        style={{
          width: `${CHART_HEIGHT}px`,
          height: `${CHART_HEIGHT}px`,
          border: '2px solid red',
          margin: '1em',
        }}
      >
        <DataProvider
          defaultLoader={staticLoader}
          timeDomain={staticXDomain}
          series={[]}
        >
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" />
          <LineChart contextChart={{ visible: false }} />
        </DataProvider>
      </div>
      <div
        style={{
          width: `${CHART_HEIGHT}px`,
          height: `${CHART_HEIGHT}px`,
          border: '2px solid red',
          margin: '1em',
        }}
      >
        <DataProvider
          defaultLoader={staticLoader}
          timeDomain={staticXDomain}
          series={[]}
        >
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" />
          <LineChart
            contextChart={{
              visible: true,
              height: 250,
            }}
          />
        </DataProvider>
      </div>
      <div
        style={{
          width: `${CHART_HEIGHT}px`,
          height: `${CHART_HEIGHT}px`,
          border: '2px solid red',
          margin: '1em',
        }}
      >
        <DataProvider
          defaultLoader={staticLoader}
          timeDomain={staticXDomain}
          series={[]}
        >
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" />
          <LineChart xAxisHeight={25} />
        </DataProvider>
      </div>
    </div>
  ))
  .add('Full-size', () => (
    <div style={{ height: '100vh' }}>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        series={[]}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <LineChart />
      </DataProvider>
    </div>
  ))
  .add('Resizing', () => {
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
              All of the components should be entirely contained in the red box
            </p>
            <button
              type="button"
              onClick={() => this.setState({ width: nextWidth })}
            >
              change to {nextWidth} pixels wide
            </button>
            <button
              type="button"
              onClick={() => this.setState({ height: nextHeight })}
            >
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
                timeDomain={staticXDomain}
                series={[]}
              >
                <Series id="1" color="steelblue" />
                <Series id="2" color="maroon" />
                <LineChart />
              </DataProvider>
            </div>
          </React.Fragment>
        );
      }
    }
    return <ResizingChart />;
  })
  .add('Custom default accessors', () => (
    <DataProvider
      defaultLoader={customAccessorLoader}
      timeDomain={staticXDomain}
      timeAccessor={d => d[0]}
      yAccessor={d => d[1]}
      series={[]}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('min/max', () => {
    const y0Accessor = d => d.value - 0.5;
    const y1Accessor = d => d.value + 0.5;
    return (
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        series={[]}
      >
        <Series
          id="1"
          color="steelblue"
          y0Accessor={y0Accessor}
          y1Accessor={y1Accessor}
        />
        <Series id="2" color="maroon" />
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
    );
  })
  .add('min/max (step series)', () => {
    const y0Accessor = d => d.value - 0.5;
    const y1Accessor = d => d.value + 0.5;
    return (
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        series={[]}
      >
        <Series
          id="1"
          color="steelblue"
          y0Accessor={y0Accessor}
          y1Accessor={y1Accessor}
          step
        />
        <Series id="2" color="maroon" step />
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
    );
  })
  .add('min/max with raw points', () => {
    const y0Accessor = d => d.value - 0.5;
    const y1Accessor = d => d.value + 0.5;
    return (
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        series={[]}
      >
        <Series
          id="1"
          color="steelblue"
          y0Accessor={y0Accessor}
          y1Accessor={y1Accessor}
        />
        <Series id="2" color="maroon" drawPoints />
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
    );
  })
  .add('Loading data from api', () => (
    <DataProvider
      defaultLoader={quandlLoader}
      timeDomain={[+moment().subtract(10, 'year'), +moment()]}
      series={[]}
      pointsPerSeries={100}
    >
      <Series id="COM/COFFEE_BRZL" color="steelblue" />
      <Series id="COM/COFFEE_CLMB" color="red" />
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Hide series', () => {
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
              timeDomain={staticXDomain}
              series={[]}
            >
              <Series id="1" color="steelblue" hidden={hiddenSeries[1]} />
              <Series id="2" color="maroon" hidden={hiddenSeries[2]} />
              <LineChart height={CHART_HEIGHT} />
            </DataProvider>
            <button type="button" onClick={() => this.toggleHide(1)}>
              Hide series 1
            </button>
            <button type="button" onClick={() => this.toggleHide(2)}>
              Hide series 2
            </button>
          </React.Fragment>
        );
      }
    }
    return <HiddenSeries />;
  })
  .add('Specify y domain', () => {
    const staticDomain = [-5, 5];
    const staticSubDomain = [-2, 2];

    class SpecifyDomain extends React.Component {
      state = { yDomains: {}, ySubDomains: {} };

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

      setStaticSubDomain = key => {
        const { ySubDomains } = this.state;
        if (ySubDomains[key]) {
          const newYSubDomains = { ...ySubDomains };
          delete newYSubDomains[key];
          this.setState({ ySubDomains: newYSubDomains });
          action(`Removing static domain`)(key);
          return;
        }
        action(`Setting subdomain to DataProvider`)(key);
        this.setState({
          ySubDomains: { ...ySubDomains, [key]: staticSubDomain },
        });
      };

      render() {
        const { yDomains, ySubDomains } = this.state;

        const isEnabled = domain => (domain ? '(enabled)' : '(disabled)');

        return (
          <React.Fragment>
            <DataProvider
              defaultLoader={staticLoader}
              timeDomain={staticXDomain}
              series={[]}
            >
              <Series
                id="1"
                color="steelblue"
                yDomain={yDomains[1]}
                ySubDomain={ySubDomains[1]}
              />
              <Series
                id="2"
                color="maroon"
                yDomain={yDomains[2]}
                ySubDomain={ySubDomains[2]}
              />
              <LineChart height={CHART_HEIGHT} />
            </DataProvider>
            <button type="button" onClick={() => this.setStaticDomain(1)}>
              Set blue domain {isEnabled(yDomains[1])}
            </button>
            <button type="button" onClick={() => this.setStaticSubDomain(1)}>
              Set blue subdomain {isEnabled(ySubDomains[1])}
            </button>
            <button type="button" onClick={() => this.setStaticDomain(2)}>
              Set maroon domain {isEnabled(yDomains[2])}
            </button>
            <button type="button" onClick={() => this.setStaticSubDomain(2)}>
              Set maroon subdomain {isEnabled(ySubDomains[2])}
            </button>
          </React.Fragment>
        );
      }
    }
    return <SpecifyDomain />;
  })
  .add('Annotations', () => {
    const series = staticLoader({
      id: 1,
      reason: 'MOUNTED',
      timeDomain: staticXDomain,
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
        timeDomain={staticXDomain}
        series={[]}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <LineChart height={CHART_HEIGHT} annotations={exampleAnnotations} />
      </DataProvider>
    );
  })
  .add('Click events', () => {
    const series = staticLoader({
      id: 1,
      reason: 'MOUNTED',
      timeDomain: staticXDomain,
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
        timeDomain={staticXDomain}
        series={[]}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
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
  .add('Draw points', () => (
    <React.Fragment>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        pointsPerSeries={100}
        series={[]}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" drawPoints />
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        pointsPerSeries={100}
        series={[]}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" drawPoints pointWidth={10} />
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        pointsPerSeries={100}
        series={[]}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" drawPoints />
        <LineChart height={CHART_HEIGHT} pointWidth={4} />
      </DataProvider>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        pointsPerSeries={100}
        drawPoints={(d, _, __, { x, y, color }) => (
          <polygon
            points={`${x - 5} ${y},${x} ${y - 5},${x + 5} ${y},${x} ${y + 5}`}
            fill={color}
          />
        )}
        series={[]}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <LineChart height={CHART_HEIGHT} pointWidth={4} />
      </DataProvider>
    </React.Fragment>
  ))
  .add('Without context chart', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[]}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} contextChart={{ visible: false }} />
    </DataProvider>
  ))
  .add('Non-Zoomable', () => {
    class ZoomToggle extends React.Component {
      state = {
        zoomable: true,
        yZoomable: { 1: false, 2: false },
      };

      toggleZoom = id => {
        const { yZoomable } = this.state;
        action('zoomed')(`${id} - ${!yZoomable[id]}`);
        this.setState({
          yZoomable: {
            ...yZoomable,
            [id]: !yZoomable[id],
          },
        });
      };

      render() {
        const { zoomable, yZoomable } = this.state;
        return (
          <React.Fragment>
            <DataProvider
              defaultLoader={staticLoader}
              timeDomain={staticXDomain}
              series={[
                { id: 1, color: 'steelblue', zoomable: yZoomable[1] },
                { id: 2, color: 'maroon', zoomable: yZoomable[2] },
              ]}
            >
              <LineChart height={CHART_HEIGHT} zoomable={zoomable} />
            </DataProvider>
            <button
              type="button"
              onClick={() => this.setState({ zoomable: !zoomable })}
            >
              Toggle x zoom [{zoomable ? 'on' : 'off'}]
            </button>
            <button type="button" onClick={() => this.toggleZoom(1)}>
              Toggle y1 zoom [{yZoomable[1] !== false ? 'on' : 'off'}]
            </button>
            <button type="button" onClick={() => this.toggleZoom(2)}>
              Toggle y2 zoom [{yZoomable[2] !== false ? 'on' : 'off'}]
            </button>
          </React.Fragment>
        );
      }
    }
    return <ZoomToggle />;
  })
  .add('Dynamic x domain', () => {
    class DynamicXDomain extends React.Component {
      state = {
        xDomain: staticXDomain,
      };

      toggleXDomain = () => {
        const { xDomain } = this.state;
        const newDomain = isEqual(xDomain, staticXDomain)
          ? [
              staticXDomain[0] - 100000000 * 50,
              staticXDomain[1] + 100000000 * 50,
            ]
          : staticXDomain;
        this.setState({ xDomain: newDomain });
      };

      render() {
        const { xDomain } = this.state;
        return (
          <div>
            <button type="button" onClick={this.toggleXDomain}>
              {isEqual(xDomain, staticXDomain)
                ? 'Shrink xDomain'
                : 'Reset base domain'}
            </button>
            <DataProvider
              defaultLoader={staticLoader}
              series={[
                { id: 1, color: 'steelblue' },
                { id: 2, color: 'maroon' },
              ]}
              timeDomain={xDomain}
            >
              <LineChart height={CHART_HEIGHT} />
            </DataProvider>
          </div>
        );
      }
    }
    return <DynamicXDomain />;
  })
  .add('ySubDomain', () => (
    <React.Fragment>
      <h1>Set on DataProvider ([0.25, 0.5])</h1>
      <p>
        The ySubDomain for the chart should be [0.25, 0.5]. The context chart
        should be [0,1].
      </p>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        ySubDomain={[0.25, 0.5]}
        series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
      >
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
      <h1>Set on Series</h1>
      <p>
        The ySubDomain for the chart should be [0.25, 0.5] for blue{' '}
        <em>only</em>. Maroon should be [0, 1]
      </p>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        series={[
          { id: 3, color: 'steelblue', ySubDomain: [0.25, 0.5] },
          { id: 4, color: 'maroon' },
        ]}
      >
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
      <h1>Set on Collection</h1>
      <p>
        The ySubDomain for the chart should be [0.0, 0.5] for the green
        collection (includes all lines).
      </p>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        collections={[{ id: 'all', color: 'green', ySubDomain: [0.0, 0.5] }]}
        series={[
          {
            id: 3,
            collectionId: 'all',
            color: 'steelblue',
            ySubDomain: [0.25, 0.5],
          },
          { id: 4, collectionId: 'all', color: 'maroon' },
        ]}
      >
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
      <h1>Set on Series with yDomain</h1>
      <p>
        The LineChart should be zoomed-in for the blue line, but the context
        chart should be zoomed-out (for the blue line). The blue line should
        have a maximum zoom-out range of [-1, 2].
      </p>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        series={[
          {
            id: 3,
            color: 'steelblue',
            ySubDomain: [0.25, 0.75],
            yDomain: [-1, 2],
          },
          { id: 4, color: 'maroon' },
        ]}
      >
        <LineChart height={CHART_HEIGHT} />
      </DataProvider>
    </React.Fragment>
  ))
  .add('Dynamic x sub domain', () => {
    const xSubDomainFirst = [
      Date.now() - 1000 * 60 * 60 * 24 * 20,
      Date.now() - 1000 * 60 * 60 * 24 * 10,
    ];

    const xSubDomainSecond = [
      Date.now() - 1000 * 60 * 60 * 24 * 10,
      Date.now(),
    ];

    class CustomXSubDomain extends React.Component {
      state = {
        isFirst: true,
      };

      render() {
        const { isFirst } = this.state;
        return (
          <React.Fragment>
            <button
              type="button"
              onClick={() => this.setState({ isFirst: !isFirst })}
            >
              {isFirst ? `Switch xSubDomain` : `Switch back xSubDomain`}
            </button>
            <DataProvider
              defaultLoader={staticLoader}
              timeDomain={staticXDomain}
              timeSubDomain={isFirst ? xSubDomainFirst : xSubDomainSecond}
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
    return <CustomXSubDomain />;
  })
  .add('Live loading', () => (
    <DataProvider
      defaultLoader={liveLoader}
      timeDomain={liveXDomain}
      updateInterval={33}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Live loading and ruler', () => (
    <div>
      <DataProvider
        defaultLoader={liveLoader}
        timeDomain={liveXDomain}
        updateInterval={33}
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
            timeLabel: point =>
              moment(point.timestamp).format('DD-MM-YYYY HH:mm:ss'),
          }}
        />
      </DataProvider>
      <h3>With ruler timestamp</h3>
      <DataProvider
        defaultLoader={liveLoader}
        timeDomain={liveXDomain}
        updateInterval={33}
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
            timeLabel: point =>
              moment(point.timestamp).format('DD-MM-YYYY HH:mm:ss'),
            timestamp: Date.now() - 1000 * 10,
          }}
        />
      </DataProvider>
      <h3>With custom ruler timestamp position</h3>
      <DataProvider
        defaultLoader={liveLoader}
        timeDomain={liveXDomain}
        updateInterval={33}
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
            timeLabel: point =>
              moment(point.timestamp).format('DD-MM-YYYY HH:mm:ss'),
            timestamp: Date.now() - 1000 * 10,
            getTimeLabelPosition: defaultPosition => defaultPosition - 100,
          }}
        />
      </DataProvider>
    </div>
  ))

  .add('Enable/disable series', () => {
    const colors = {
      'COM/COFFEE_BRZL': 'steelblue',
      'COM/COFFEE_CLMB': 'maroon',
    };
    const options = [
      { value: 'COM/COFFEE_BRZL', label: 'Brazil coffe price' },
      { value: 'COM/COFFEE_CLMB', label: 'Columbia coffe price' },
    ];

    const xDomain = [+moment().subtract(10, 'year'), +moment()];

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
              isMulti
              value={series}
              options={options}
              onChange={this.onChangeSeries}
              style={{ marginBottom: '15px' }}
            />
            <DataProvider
              defaultLoader={quandlLoader}
              pointsPerSeries={100}
              timeDomain={xDomain}
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
  .add('Custom context brush', () => {
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
  .add('Sticky x subdomain', () => (
    <DataProvider
      defaultLoader={liveLoader}
      timeDomain={liveXDomain}
      timeSubDomain={[Date.now() - 1000 * 20, Date.now() - 1000 * 10]}
      updateInterval={33}
      series={[
        { id: 1, color: 'steelblue', name: 'name1' },
        { id: 2, color: 'maroon', name: 'name2' },
      ]}
      isTimeSubDomainSticky
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Sticky x subdomain and ruler', () => (
    <DataProvider
      defaultLoader={liveLoader}
      timeDomain={liveXDomain}
      timeSubDomain={[Date.now() - 1000 * 20, Date.now() - 1000 * 10]}
      updateInterval={33}
      series={[
        { id: 1, color: 'steelblue', name: 'name1' },
        { id: 2, color: 'maroon', name: 'name2' },
      ]}
      isTimeSubDomainSticky
    >
      <LineChart
        height={CHART_HEIGHT}
        ruler={{
          visible: true,
          yLabel: point =>
            `${point.name}: ${Number.parseFloat(point.value).toFixed(3)}`,
          timeLabel: point =>
            moment(point.timestamp).format('DD-MM-YYYY HH:mm:ss'),
        }}
      />
    </DataProvider>
  ))
  .add('Limit x subdomain', () => {
    class LimitXSubDomain extends React.Component {
      limitXSubDomain = subDomain => {
        const subDomainLength = subDomain[1] - subDomain[0];
        const subDomainEnd = Math.min(
          subDomain[1],
          Date.now() - 1000 * 60 * 60 * 24 * 5
        );
        const subDomainStart = subDomainEnd - subDomainLength;
        return [subDomainStart, subDomainEnd];
      };

      render() {
        return (
          <div>
            <DataProvider
              defaultLoader={staticLoader}
              series={[
                { id: 1, color: 'steelblue' },
                { id: 2, color: 'maroon' },
              ]}
              timeDomain={staticXDomain}
              timeSubDomain={[
                Date.now() - 1000 * 60 * 60 * 24 * 15,
                Date.now() - 1000 * 60 * 60 * 24 * 10,
              ]}
              limitTimeSubDomain={this.limitXSubDomain}
            >
              <LineChart height={CHART_HEIGHT} />
            </DataProvider>
          </div>
        );
      }
    }
    return <LimitXSubDomain />;
  })
  .add('onMouseOut', () => (
    <DataProvider
      defaultLoader={staticLoader}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
      timeDomain={staticXDomain}
      xSubDomain={[
        Date.now() - 1000 * 60 * 60 * 24 * 30,
        Date.now() - 1000 * 60 * 60 * 24 * 10,
      ]}
    >
      <LineChart
        height={CHART_HEIGHT}
        onMouseOut={action('mouse out')}
        onBlur={() => {}}
      />
    </DataProvider>
  ))
  .add('onUpdateDomains', () => (
    <DataProvider
      defaultLoader={staticLoader}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
      timeDomain={staticXDomain}
      xSubDomain={[
        Date.now() - 1000 * 60 * 60 * 24 * 30,
        Date.now() - 1000 * 60 * 60 * 24 * 10,
      ]}
      onUpdateDomains={action('onUpdateDomains')}
    >
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ));
