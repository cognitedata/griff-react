import React from 'react';
import 'react-select/dist/react-select.css';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { DataProvider, LineChart, AxisDisplayMode } from '../src';
import { staticLoader } from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('Y-Axis Modes', module)
  .add('Mouse events', () => {
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
              timeDomain={staticXDomain}
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
  .add('Without y axis', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        yAxisDisplayMode={AxisDisplayMode.NONE}
      />
    </DataProvider>
  ))
  .add('Collapsed y axis', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
    >
      <LineChart
        height={CHART_HEIGHT}
        yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
      />
    </DataProvider>
  ))
  .add('Collapsed collection', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      collections={[{ id: 'all', color: 'deepred' }]}
      series={[
        { id: 1, collectionId: 'all', color: 'steelblue' },
        { id: 2, collectionId: 'all', color: 'maroon' },
      ]}
    >
      <LineChart
        height={CHART_HEIGHT}
        yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
      />
    </DataProvider>
  ))
  .add('Collapsed collected series', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      collections={[{ id: 'all', color: 'deepred' }]}
      series={[
        {
          id: 1,
          collectionId: 'all',
          color: 'steelblue',
          yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
        },
        { id: 2, collectionId: 'all', color: 'maroon' },
      ]}
    >
      <LineChart
        height={CHART_HEIGHT}
        yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
      />
    </DataProvider>
  ))
  .add('Some hidden', () => {
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
              timeDomain={staticXDomain}
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
  .add('Some collapsed', () => {
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
              timeDomain={staticXDomain}
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
  .add('Some collapsed (until hover)', () => {
    // eslint-disable-next-line
    class SomeCollapsed extends React.Component {
      state = {
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
        yAxisDisplayMode: AxisDisplayMode.ALL,
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
              timeDomain={staticXDomain}
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
  .add('Some collapsed (until hover) with collections', () => {
    // eslint-disable-next-line
    class SomeCollapsed extends React.Component {
      state = {
        collections: [
          { id: 'default-expanded', color: 'red' },
          {
            id: 'default-collapsed',
            color: 'blue',
            yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
          },
        ],
        series: [
          {
            id: 1,
            color: 'steelblue',
            yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
          },
          {
            id: 2,
            color: 'maroon',
            collectionId: 'default-expanded',
          },
          {
            id: 3,
            color: 'orange',
            collectionId: 'default-expanded',
            yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
          },
          {
            id: 4,
            color: 'green',
            collectionId: 'default-collapsed',
          },
          {
            id: 5,
            color: 'gray',
            collectionId: 'default-collapsed',
            yAxisDisplayMode: AxisDisplayMode.COLLAPSED,
          },
        ],
        yAxisDisplayMode: AxisDisplayMode.ALL,
      };

      expandAll = (e, seriesId) => {
        if (seriesId === 'collapsed') {
          const expand = s => ({ ...s, yAxisDisplayMode: AxisDisplayMode.ALL });
          this.setState({
            series: this.state.series.map(expand),
            collections: this.state.collections.map(expand),
          });
        }
        if (this.collapseTimer) {
          clearTimeout(this.collapseTimer);
        }
      };

      collapseSome = () => {
        this.collapseTimer = setTimeout(() => {
          this.setState({
            series: this.state.series.map(s => ({
              ...s,
              yAxisDisplayMode:
                s.id === 1 || s.id === 3 || s.id === 5
                  ? AxisDisplayMode.COLLAPSED
                  : AxisDisplayMode.ALL,
            })),
            collections: this.state.collections.map(s => ({
              ...s,
              yAxisDisplayMode:
                s.id === 'default-collapsed'
                  ? AxisDisplayMode.COLLAPSED
                  : AxisDisplayMode.ALL,
            })),
          });
        }, 50);
      };

      render() {
        const { collections, series, yAxisDisplayMode } = this.state;
        return (
          <React.Fragment>
            <DataProvider
              defaultLoader={staticLoader}
              timeDomain={staticXDomain}
              collections={collections}
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
  .add('AxisCollection modes (button)', () => {
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
              timeDomain={staticXDomain}
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
  .add('AxisCollection modes (hover)', () => {
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
              timeDomain={staticXDomain}
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
  });
