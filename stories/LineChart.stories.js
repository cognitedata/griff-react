import React from 'react';
import moment from 'moment';
import Select from 'react-select';
import isEqual from 'lodash.isequal';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import {
  Brush,
  Collection,
  Griff,
  LineChart,
  Series,
  GriffContext,
} from '../build/src';
import quandlLoader from './quandlLoader';

import {
  staticLoader,
  monoLoader,
  customAccessorLoader,
  liveLoader,
} from './loaders';
import GriffDebugger from './GriffDebugger';

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
  .add('Empty', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ))
  .add('Dynamic series', () => {
    const randomColor = () =>
      `rgb(${Math.round(Math.random() * 255)},${Math.round(
        Math.random() * 255
      )},${Math.round(Math.random() * 255)},1)`;

    class DynamicSeries extends React.Component {
      state = {
        series: [],
      };

      addSeries = () =>
        this.setState(({ series }) => ({
          series: [...series, { id: series.length + 1, color: randomColor() }],
        }));

      clearSeries = () => this.setState({ series: [] });

      render() {
        const { series } = this.state;
        return (
          <div>
            <button type="button" onClick={this.addSeries}>
              Add series
            </button>
            <button type="button" onClick={this.clearSeries}>
              Remove all series
            </button>
            <Griff loader={staticLoader} timeDomain={staticXDomain}>
              {series.map(s => (
                <Series key={`series-${s.id}`} {...s} />
              ))}
              <LineChart height={CHART_HEIGHT} />
            </Griff>
          </div>
        );
      }
    }
    return <DynamicSeries />;
  })
  .add('Basic', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ))
  .add('Basic with yDomains', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" ySubDomain={[0, 5]} />
      <Series id="2" color="maroon" ySubDomain={[-1, 1]} />
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ))
  .add('Custom tick formatting', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart
        height={CHART_HEIGHT}
        xAxisFormatter={n => n / 1000}
        yAxisFormatter={n => n * 1000}
      />
    </Griff>
  ))
  .add('Custom # of y-axis ticks', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} yAxisTicks={15} />
    </Griff>
  ))
  .add('Multiple', () => (
    <React.Fragment>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <Series id="3" color="orange" />
        <LineChart height={CHART_HEIGHT} />
      </Griff>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <Series id="3" color="orange" hidden />
        <LineChart height={CHART_HEIGHT} />
      </Griff>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <LineChart height={CHART_HEIGHT} />
      </Griff>
    </React.Fragment>
  ))
  .add('Single-value in y axis', () => (
    <React.Fragment>
      <Griff timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" loader={monoLoader(0)} />
        <Series id="2" color="maroon" loader={monoLoader(0.5)} />
        <Series id="3" color="orange" loader={monoLoader(-0.5)} />
        <LineChart height={CHART_HEIGHT} />
      </Griff>
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
        <Griff loader={staticLoader} timeDomain={staticXDomain}>
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" />
          <LineChart />
        </Griff>
      </div>
      <div
        style={{
          width: `${CHART_HEIGHT}px`,
          height: `${CHART_HEIGHT}px`,
          border: '2px solid red',
          margin: '1em',
        }}
      >
        <Griff loader={staticLoader} timeDomain={staticXDomain}>
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" />
          <LineChart contextChart={{ visible: false }} />
        </Griff>
      </div>
      <div
        style={{
          width: `${CHART_HEIGHT}px`,
          height: `${CHART_HEIGHT}px`,
          border: '2px solid red',
          margin: '1em',
        }}
      >
        <Griff loader={staticLoader} timeDomain={staticXDomain}>
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" />
          <LineChart
            contextChart={{
              visible: true,
              height: 250,
            }}
          />
        </Griff>
      </div>
      <div
        style={{
          width: `${CHART_HEIGHT}px`,
          height: `${CHART_HEIGHT}px`,
          border: '2px solid red',
          margin: '1em',
        }}
      >
        <Griff loader={staticLoader} timeDomain={staticXDomain}>
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" />
          <LineChart xAxisHeight={25} />
        </Griff>
      </div>
    </div>
  ))
  .add('Full-size', () => (
    <div style={{ height: '100vh' }}>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <LineChart />
      </Griff>
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
              <Griff loader={staticLoader} timeDomain={staticXDomain}>
                <Series id="1" color="steelblue" />
                <Series id="2" color="maroon" />
                <LineChart />
              </Griff>
            </div>
          </React.Fragment>
        );
      }
    }
    return <ResizingChart />;
  })
  .add('Custom default accessors', () => (
    <Griff
      loader={customAccessorLoader}
      timeDomain={staticXDomain}
      timeAccessor={d => d[0]}
      yAccessor={d => d[1]}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ))
  .add('min/max', () => {
    const y0Accessor = d => d.y - 0.5;
    const y1Accessor = d => d.y + 0.5;
    return (
      <React.Fragment>
        <Griff loader={staticLoader} timeDomain={staticXDomain}>
          <Series
            id="1"
            color="steelblue"
            y0Accessor={y0Accessor}
            y1Accessor={y1Accessor}
          />
          <Series id="2" color="maroon" />
          <LineChart height={CHART_HEIGHT} />
        </Griff>
        <Griff loader={staticLoader} timeDomain={staticXDomain}>
          <Series
            id="1"
            color="steelblue"
            y0Accessor={y0Accessor}
            y1Accessor={y1Accessor}
            step
          />
          <Series id="2" color="maroon" step />
          <LineChart height={CHART_HEIGHT} />
        </Griff>
        <Griff loader={staticLoader} timeDomain={staticXDomain}>
          <Series
            id="1"
            color="steelblue"
            y0Accessor={y0Accessor}
            y1Accessor={y1Accessor}
          />
          <Series id="2" color="maroon" drawPoints />
          <LineChart height={CHART_HEIGHT} />
        </Griff>
      </React.Fragment>
    );
  })
  .add('Loading data from api', () => (
    <Griff
      loader={quandlLoader}
      timeDomain={[+moment().subtract(10, 'year'), +moment()]}
      pointsPerSeries={100}
    >
      <Series id="COM/COFFEE_BRZL" color="steelblue" />
      <Series id="COM/COFFEE_CLMB" color="red" />
      <LineChart height={CHART_HEIGHT} />
    </Griff>
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
            <Griff loader={staticLoader} timeDomain={staticXDomain}>
              <Series id="1" color="steelblue" hidden={hiddenSeries[1]} />
              <Series id="2" color="maroon" hidden={hiddenSeries[2]} />
              <LineChart height={CHART_HEIGHT} />
              <GriffContext.Consumer>
                {({ seriesById }) => (
                  <div>
                    {Object.keys(seriesById).map(id => (
                      <button
                        key={`show-hide-${id}`}
                        type="button"
                        onClick={() => this.toggleHide(id)}
                      >
                        {seriesById[id].hidden ? 'Show' : 'Hide'} series {id}
                      </button>
                    ))}
                  </div>
                )}
              </GriffContext.Consumer>
            </Griff>
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
        action(`Setting domain to Griff`)(key);
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
        action(`Setting subdomain to Griff`)(key);
        this.setState({
          ySubDomains: { ...ySubDomains, [key]: staticSubDomain },
        });
      };

      render() {
        const { yDomains, ySubDomains } = this.state;

        const isEnabled = domain => (domain ? '(enabled)' : '(disabled)');

        return (
          <React.Fragment>
            <Griff loader={staticLoader} timeDomain={staticXDomain}>
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
            </Griff>
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
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <LineChart height={CHART_HEIGHT} annotations={exampleAnnotations} />
      </Griff>
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
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
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
      </Griff>
    );
  })
  .add('Draw points', () => (
    <React.Fragment>
      <Griff
        loader={staticLoader}
        timeDomain={staticXDomain}
        pointsPerSeries={100}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" drawPoints />
        <LineChart height={CHART_HEIGHT} />
      </Griff>
      <Griff
        loader={staticLoader}
        timeDomain={staticXDomain}
        pointsPerSeries={100}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" drawPoints pointWidth={10} />
        <LineChart height={CHART_HEIGHT} />
      </Griff>
      <Griff
        loader={staticLoader}
        timeDomain={staticXDomain}
        pointsPerSeries={100}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" drawPoints />
        <LineChart height={CHART_HEIGHT} pointWidth={4} />
      </Griff>
      <Griff
        loader={staticLoader}
        timeDomain={staticXDomain}
        pointsPerSeries={100}
        drawPoints={(d, _, __, { x, y, color }) => (
          <polygon
            points={`${x - 5} ${y},${x} ${y - 5},${x + 5} ${y},${x} ${y + 5}`}
            fill={color}
          />
        )}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <LineChart height={CHART_HEIGHT} pointWidth={4} />
      </Griff>
    </React.Fragment>
  ))
  .add('Without context chart', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} contextChart={{ visible: false }} />
    </Griff>
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
            <Griff loader={staticLoader} timeDomain={staticXDomain}>
              <Series id="1" color="steelblue" zoomable={yZoomable[1]} />
              <Series id="2" color="maroon" zoomable={yZoomable[2]} />
              <LineChart height={CHART_HEIGHT} zoomable={zoomable} />
            </Griff>
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
  .add('Dynamic time domain', () => {
    class DynamicXDomain extends React.Component {
      state = {
        timeDomain: staticXDomain,
      };

      toggleTimeDomain = () => {
        const { timeDomain } = this.state;
        const d = isEqual(timeDomain, staticXDomain)
          ? [
              staticXDomain[0] - 100000000 * 50,
              staticXDomain[1] + 100000000 * 50,
            ]
          : staticXDomain;
        this.setState({ timeDomain: d });
      };

      render() {
        const { timeDomain } = this.state;
        return (
          <div>
            <button type="button" onClick={this.toggleTimeDomain}>
              {isEqual(timeDomain, staticXDomain)
                ? 'Shrink timeDomain'
                : 'Reset base domain'}
            </button>
            <Griff loader={staticLoader} timeDomain={timeDomain}>
              <Series id="1" color="steelblue" />
              <Series id="2" color="maroon" />
              <LineChart height={CHART_HEIGHT} />
            </Griff>
          </div>
        );
      }
    }
    return <DynamicXDomain />;
  })
  .add('ySubDomain', () => (
    <React.Fragment>
      <h1>Set on Griff ([0.25, 0.5])</h1>
      <p>
        The ySubDomain for the chart should be [0.25, 0.5]. The context chart
        should be [0,1].
      </p>
      <Griff
        loader={staticLoader}
        timeDomain={staticXDomain}
        ySubDomain={[0.25, 0.5]}
      >
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <LineChart height={CHART_HEIGHT} />
      </Griff>
      <h1>Set on Series</h1>
      <p>
        The ySubDomain for the chart should be [0.25, 0.5] for blue{' '}
        <em>only</em>. Maroon should be [0, 1]
      </p>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" ySubDomain={[0.25, 0.5]} />
        <Series id="2" color="maroon" />
        <LineChart height={CHART_HEIGHT} />
      </Griff>
      <h1>Set on Collection</h1>
      <p>
        The ySubDomain for the chart should be [0.0, 0.5] for the green
        collection (includes all lines).
      </p>
      <Griff loader={staticLoader} timeDomain={staticXDomain} collections={[]}>
        <Collection id="all" ySubDomain={[0.0, 0.5]} color="green">
          <Series id="1" color="steelblue" ySubDomain={[0.25, 0.5]} />
          <Series id="2" color="maroon" />
        </Collection>
        <LineChart height={CHART_HEIGHT} />
      </Griff>
      <h1>Set on Series with yDomain</h1>
      <p>
        The LineChart should be zoomed-in for the blue line, but the context
        chart should be zoomed-out (for the blue line). The blue line should
        have a maximum zoom-out range of [-1, 2].
      </p>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series
          id="1"
          color="steelblue"
          ySubDomain={[0.25, 0.75]}
          yDomain={[-1, 2]}
        />
        <Series id="2" color="maroon" />
        <LineChart height={CHART_HEIGHT} />
      </Griff>
    </React.Fragment>
  ))
  .add('Dynamic time sub domain', () => {
    const timeSubDomainFirst = [
      Date.now() - 1000 * 60 * 60 * 24 * 20,
      Date.now() - 1000 * 60 * 60 * 24 * 10,
    ];

    const timeSubDomainSecond = [
      Date.now() - 1000 * 60 * 60 * 24 * 10,
      Date.now(),
    ];

    class CustomTimeSubDomain extends React.Component {
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
              {isFirst ? `Switch timeSubDomain` : `Switch back timeSubDomain`}
            </button>
            <Griff
              loader={staticLoader}
              timeDomain={staticXDomain}
              timeSubDomain={isFirst ? timeSubDomainFirst : timeSubDomainSecond}
            >
              <Series id="1" color="steelblue" />
              <Series id="2" color="maroon" />
              <LineChart height={CHART_HEIGHT} />
            </Griff>
          </React.Fragment>
        );
      }
    }
    return <CustomTimeSubDomain />;
  })
  .add('Live loading', () => (
    <Griff loader={liveLoader} timeDomain={liveXDomain} updateInterval={33}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ))
  .add('Live loading and ruler', () => (
    <div>
      <Griff loader={liveLoader} timeDomain={liveXDomain} updateInterval={33}>
        <Series id="1" color="steelblue" name="name1" />
        <Series id="2" color="maroon" name="name2" />
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
      </Griff>
      <h3>With ruler timestamp</h3>
      <Griff loader={liveLoader} timeDomain={liveXDomain} updateInterval={33}>
        <Series id="1" color="steelblue" name="name1" />
        <Series id="2" color="maroon" name="name2" />
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
      </Griff>
      <h3>With custom ruler timestamp position</h3>
      <Griff loader={liveLoader} timeDomain={liveXDomain} updateInterval={33}>
        <Series id="1" color="steelblue" name="name1" />
        <Series id="2" color="maroon" name="name2" />
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
      </Griff>
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
            <Griff
              loader={quandlLoader}
              pointsPerSeries={100}
              timeDomain={xDomain}
            >
              {series.map(s => (
                <Series key={s.value} id={s.value} color={colors[s.value]} />
              ))}
              <LineChart height={CHART_HEIGHT} />
            </Griff>
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
  .add('Sticky time subdomain', () => (
    <Griff
      loader={liveLoader}
      timeDomain={liveXDomain}
      timeSubDomain={[Date.now() - 1000 * 20, Date.now() - 1000 * 10]}
      updateInterval={33}
      isTimeSubDomainSticky
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ))
  .add('Sticky time subdomain and ruler', () => (
    <Griff
      loader={liveLoader}
      timeDomain={liveXDomain}
      timeSubDomain={[Date.now() - 1000 * 20, Date.now() - 1000 * 10]}
      updateInterval={33}
      isTimeSubDomainSticky
    >
      <Series id="1" color="steelblue" name="name1" />
      <Series id="2" color="maroon" name="name2" />
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
    </Griff>
  ))
  .add('Limit time subdomain', () => {
    class LimitTimeSubDomain extends React.Component {
      limitTimeSubDomain = subDomain => {
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
            <Griff
              loader={staticLoader}
              timeDomain={staticXDomain}
              timeSubDomain={[
                Date.now() - 1000 * 60 * 60 * 24 * 15,
                Date.now() - 1000 * 60 * 60 * 24 * 10,
              ]}
              limitTimeSubDomain={this.limitTimeSubDomain}
            >
              <Series id="1" color="steelblue" />
              <Series id="2" color="maroon" />
              <LineChart height={CHART_HEIGHT} />
            </Griff>
          </div>
        );
      }
    }
    return <LimitTimeSubDomain />;
  })
  .add('onMouseOut', () => (
    <Griff
      loader={staticLoader}
      timeDomain={staticXDomain}
      xSubDomain={[
        Date.now() - 1000 * 60 * 60 * 24 * 30,
        Date.now() - 1000 * 60 * 60 * 24 * 10,
      ]}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart
        height={CHART_HEIGHT}
        onMouseOut={action('mouse out')}
        onBlur={() => {}}
      />
    </Griff>
  ))
  .add('onUpdateDomains', () => (
    <Griff
      loader={staticLoader}
      timeDomain={staticXDomain}
      xSubDomain={[
        Date.now() - 1000 * 60 * 60 * 24 * 30,
        Date.now() - 1000 * 60 * 60 * 24 * 10,
      ]}
      onUpdateDomains={action('onUpdateDomains')}
    >
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ));
