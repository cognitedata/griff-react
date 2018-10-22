import React from 'react';
import * as d3 from 'd3';
import moment from 'moment';
import 'react-select/dist/react-select.css';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { DataProvider, LineChart } from '../src';
import { staticLoader } from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('InteractionLayer', module)
  .add('Ruler', () => (
    <DataProvider
      timeDomain={staticXDomain}
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
  .add('Area (no zoom)', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
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
  .add('Area (zoom)', () => {
    class ZoomByArea extends React.Component {
      state = { xSubDomain: null };

      onAreaDefined = area => {
        const { start, end } = area;
        const xSubDomain = [start.points[0].timestamp, end.points[0].timestamp];
        this.setState({
          xSubDomain,
        });
        action('New subdomain')(xSubDomain);
      };

      render() {
        const { xSubDomain } = this.state;
        return (
          <DataProvider
            defaultLoader={staticLoader}
            timeDomain={staticXDomain}
            timeSubDomain={xSubDomain}
            series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
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
  .add('Area (hold shift to enable)', () => {
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
              timeDomain={staticXDomain}
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
  .add('Persistent fixed area (hold shift to enable)', () => {
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
              timeDomain={staticXDomain}
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
  .add('Persistent fixed areas (click to remove)', () => {
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
              timeDomain={staticXDomain}
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
  .add('Persistent fixed areas (click outside to clear)', () => {
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
              timeDomain={staticXDomain}
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
  .add('Persistent series area (hold shift to enable)', () => {
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
              timeDomain={staticXDomain}
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
  .add('Double-click events', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        onDoubleClick={action('onDoubleClick')}
      />
    </DataProvider>
  ))
  .add('Regression: onMouseUp', () => {
    // eslint-disable-next-line
    class OnMouseUp extends React.Component {
      state = { onAreaDefined: null };

      componentDidMount() {
        this.interval = setInterval(this.toggleOnAreaDefined, 1000);
      }

      componentWillUnmount() {
        clearInterval(this.interval);
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
              timeDomain={staticXDomain}
              series={[
                { id: 1, color: 'steelblue' },
                { id: 2, color: 'maroon' },
              ]}
            >
              <LineChart height={CHART_HEIGHT} onAreaDefined={onAreaDefined} />
            </DataProvider>
            onAreaDefined:
            {onAreaDefined ? 'function' : 'null'}
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
  });
