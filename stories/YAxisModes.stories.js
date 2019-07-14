import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import {
  AxisDisplayMode,
  Collection,
  Griff,
  LineChart,
  Series,
} from '../build/src';
import { staticLoader } from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('Axes/modes/Y', module)
  .add('Mouse events', () => {
    const mouseEvent = (e, seriesId) => {
      action('Axis mouse event')(e.type, seriesId);
    };
    return (
      <React.Fragment>
        <Griff loader={staticLoader} timeDomain={staticXDomain}>
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" />
          <Series
            id="3"
            color="orange"
            yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
          />
          <Series
            id="4"
            color="green"
            yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
          />
          <LineChart
            height={CHART_HEIGHT}
            yAxisDisplayMode={AxisDisplayMode.ALL}
            onAxisMouseEnter={mouseEvent}
            onAxisMouseLeave={mouseEvent}
          />
        </Griff>
      </React.Fragment>
    );
  })
  .add('Without y axis', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart
        height={CHART_HEIGHT}
        yAxisDisplayMode={AxisDisplayMode.NONE}
      />
    </Griff>
  ))
  .add('Collapsed y axis', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart
        height={CHART_HEIGHT}
        yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
      />
    </Griff>
  ))
  .add('Collapsed collection', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="all" color="deepred">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart
        height={CHART_HEIGHT}
        yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
      />
    </Griff>
  ))
  .add('Collapsed collected series', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Collection id="all" color="deepred">
        <Series
          id="1"
          color="steelblue"
          yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
        />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart
        height={CHART_HEIGHT}
        yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
      />
    </Griff>
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
            <Griff loader={staticLoader} timeDomain={staticXDomain}>
              <Series
                id="1"
                color="steelblue"
                yAxisDisplayMode={AxisDisplayMode.NONE}
              />
              <Series id="2" color="maroon" />
              <Series
                id="3"
                color="orange"
                yAxisDisplayMode={AxisDisplayMode.NONE}
              />
              <Series id="4" color="green" />
              <LineChart
                height={CHART_HEIGHT}
                yAxisDisplayMode={yAxisDisplayMode}
              />
            </Griff>
            <button
              type="button"
              onClick={() =>
                this.setState({
                  yAxisDisplayMode: AxisDisplayMode.ALL,
                })
              }
            >
              ALL
            </button>
            <button
              type="button"
              onClick={() =>
                this.setState({
                  yAxisDisplayMode: AxisDisplayMode.NONE,
                })
              }
            >
              NONE
            </button>
            <button
              type="button"
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
  .add('Some collapsed', () => (
    <React.Fragment>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series
          id="1"
          color="steelblue"
          yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
        />
        <Series id="2" color="maroon" />
        <Series
          id="3"
          color="orange"
          yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
        />
        <Series id="4" color="green" />
        <LineChart
          height={CHART_HEIGHT}
          yAxisDisplayMode={AxisDisplayMode.ALL}
        />
      </Griff>
    </React.Fragment>
  ))
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
        const { series: stateSeries } = this.state;
        if (seriesId === 'collapsed') {
          const series = stateSeries.map(s => ({
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
        const { series: stateSeries } = this.state;
        this.collapseTimer = setTimeout(() => {
          const series = stateSeries.map(s => ({
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
            <Griff loader={staticLoader} timeDomain={staticXDomain}>
              {series.map(s => (
                <Series key={s.id} {...s} />
              ))}
              <LineChart
                height={CHART_HEIGHT}
                yAxisDisplayMode={yAxisDisplayMode}
                onAxisMouseEnter={this.expandAll}
                onAxisMouseLeave={this.collapseSome}
              />
            </Griff>
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
        collections: {
          'default-expanded': AxisDisplayMode.ALL,
          'default-collapsed': AxisDisplayMode.COLLAPSED,
        },
        series: {
          1: AxisDisplayMode.COLLAPSED,
          2: AxisDisplayMode.ALL,
          3: AxisDisplayMode.COLLAPSED,
          4: AxisDisplayMode.ALL,
          5: AxisDisplayMode.COLLAPSED,
        },
      };

      expandAll = (e, seriesId) => {
        const { collections, series } = this.state;
        if (seriesId === 'collapsed') {
          const expand = (acc, id) => ({ ...acc, [id]: AxisDisplayMode.ALL });
          this.setState({
            series: Object.keys(series).reduce(expand, {}),
            collections: Object.keys(collections).reduce(expand, {}),
          });
        }
        if (this.collapseTimer) {
          clearTimeout(this.collapseTimer);
        }
      };

      collapseSome = () => {
        const { collections, series } = this.state;
        this.collapseTimer = setTimeout(() => {
          this.setState({
            series: Object.keys(series).reduce(
              (acc, id) => ({
                ...acc,
                [id]:
                  id === '1' || id === '3' || id === '5'
                    ? AxisDisplayMode.COLLAPSED
                    : AxisDisplayMode.ALL,
              }),
              {}
            ),
            collections: Object.keys(collections).reduce(
              (acc, id) => ({
                ...acc,
                [id]:
                  id === 'default-collapsed'
                    ? AxisDisplayMode.COLLAPSED
                    : AxisDisplayMode.ALL,
              }),
              {}
            ),
          });
        }, 50);
      };

      render() {
        const { collections, series } = this.state;
        return (
          <React.Fragment>
            <Griff loader={staticLoader} timeDomain={staticXDomain}>
              <Series id="1" color="steelblue" yAxisDisplayMode={series[1]} />
              <Collection
                id="default-expanded"
                color="red"
                yAxisDisplayMode={collections['default-expanded']}
              >
                <Series id="2" color="maroon" yAxisDisplayMode={series[2]} />
                <Series id="3" color="orange" yAxisDisplayMode={series[3]} />
              </Collection>
              <Collection
                id="default-collapsed"
                color="blue"
                yAxisDisplayMode={collections['default-collapsed']}
              >
                <Series id="4" color="green" yAxisDisplayMode={series[4]} />
                <Series id="5" color="gray" yAxisDisplayMode={series[5]} />
              </Collection>
              <LineChart
                height={CHART_HEIGHT}
                onAxisMouseEnter={this.expandAll}
                onAxisMouseLeave={this.collapseSome}
              />
            </Griff>
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
            <Griff loader={staticLoader} timeDomain={staticXDomain}>
              <Series id="1" color="steelblue" />
              <Series id="2" color="maroon" />
              <LineChart
                height={CHART_HEIGHT}
                yAxisDisplayMode={yAxisDisplayMode}
              />
            </Griff>
            <button
              type="button"
              onClick={() =>
                this.setState({
                  yAxisDisplayMode: AxisDisplayMode.ALL,
                })
              }
            >
              ALL
            </button>
            <button
              type="button"
              onClick={() =>
                this.setState({
                  yAxisDisplayMode: AxisDisplayMode.NONE,
                })
              }
            >
              NONE
            </button>
            <button
              type="button"
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
            <Griff loader={staticLoader} timeDomain={staticXDomain}>
              <Series id="1" color="steelblue" />
              <Series id="2" color="maroon" />
              <LineChart
                height={CHART_HEIGHT}
                yAxisDisplayMode={yAxisDisplayMode}
                onAxisMouseEnter={this.expand}
                onAxisMouseLeave={this.collapse}
              />
            </Griff>
          </React.Fragment>
        );
      }
    }
    return <ExpandCollapse />;
  });
