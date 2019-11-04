import React from 'react';
import { action } from '@storybook/addon-actions';
import {
  AxisDisplayMode,
  Collection,
  DataProvider,
  LineChart,
  Series,
} from '../src';
import { staticLoader } from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

export default {
  title: 'Y-Axis Modes',
};

export const mouseEvents = () => {
  const mouseEvent = (e, seriesId) => {
    action('Axis mouse event')(e.type, seriesId);
  };
  return (
    <React.Fragment>
      <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
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
      </DataProvider>
    </React.Fragment>
  );
};

mouseEvents.story = {
  name: 'Mouse events',
};

export const withoutYAxis = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart height={CHART_HEIGHT} yAxisDisplayMode={AxisDisplayMode.NONE} />
  </DataProvider>
);

withoutYAxis.story = {
  name: 'Without y axis',
};

export const collapsedYAxis = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart
      height={CHART_HEIGHT}
      yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
    />
  </DataProvider>
);

collapsedYAxis.story = {
  name: 'Collapsed y axis',
};

export const collapsedCollection = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Collection id="all" color="deepred">
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
    </Collection>
    <LineChart
      height={CHART_HEIGHT}
      yAxisDisplayMode={AxisDisplayMode.COLLAPSED}
    />
  </DataProvider>
);

collapsedCollection.story = {
  name: 'Collapsed collection',
};

export const collapsedCollectedSeries = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
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
  </DataProvider>
);

collapsedCollectedSeries.story = {
  name: 'Collapsed collected series',
};

export const someHidden = () => {
  // eslint-disable-next-line
  class SomeCollapsed extends React.Component {
    state = {
      yAxisDisplayMode: AxisDisplayMode.ALL,
    };

    render() {
      const { yAxisDisplayMode } = this.state;
      return (
        <React.Fragment>
          <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
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
          </DataProvider>
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
};

someHidden.story = {
  name: 'Some hidden',
};

export const someCollapsed = () => (
  <React.Fragment>
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
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
      <LineChart height={CHART_HEIGHT} yAxisDisplayMode={AxisDisplayMode.ALL} />
    </DataProvider>
  </React.Fragment>
);

someCollapsed.story = {
  name: 'Some collapsed',
};

export const someCollapsedUntilHover = () => {
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
          <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
            {series.map(s => (
              <Series key={s.id} {...s} />
            ))}
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
};

someCollapsedUntilHover.story = {
  name: 'Some collapsed (until hover)',
};

export const someCollapsedUntilHoverWithCollections = () => {
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
          <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
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
          </DataProvider>
        </React.Fragment>
      );
    }
  }
  return <SomeCollapsed />;
};

someCollapsedUntilHoverWithCollections.story = {
  name: 'Some collapsed (until hover) with collections',
};

export const axisCollectionModesButton = () => {
  // eslint-disable-next-line
  class ExpandCollapse extends React.Component {
    state = {
      yAxisDisplayMode: AxisDisplayMode.ALL,
    };

    render() {
      const { yAxisDisplayMode } = this.state;
      return (
        <React.Fragment>
          <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
            <Series id="1" color="steelblue" />
            <Series id="2" color="maroon" />
            <LineChart
              height={CHART_HEIGHT}
              yAxisDisplayMode={yAxisDisplayMode}
            />
          </DataProvider>
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
};

axisCollectionModesButton.story = {
  name: 'AxisCollection modes (button)',
};

export const axisCollectionModesHover = () => {
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
          <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
            <Series id="1" color="steelblue" />
            <Series id="2" color="maroon" />
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
};

axisCollectionModesHover.story = {
  name: 'AxisCollection modes (hover)',
};
