/* eslint-disable max-classes-per-file */
/* eslint-disable react/no-this-in-sfc */
import React from 'react';
import * as d3 from 'd3';
import moment from 'moment';
import { action } from '@storybook/addon-actions';
import { DataProvider, LineChart, Series } from '../src';
import { functionLoader, staticLoader } from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

export default {
  title: 'Demo|components/InteractionLayer',
};

export const rulerStory = () => (
  <>
    <div style={{ height: 500 }}>
      <DataProvider
        timeDomain={staticXDomain}
        defaultLoader={staticLoader}
        xAccessor={d => d.timestamp}
        yAccessor={d => d.value}
      >
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
      </DataProvider>
    </div>
    <div style={{ height: 500 }}>
      <DataProvider
        timeDomain={staticXDomain}
        defaultLoader={functionLoader(d =>
          Math.sin((d / (staticXDomain[1] - staticXDomain[0])) * 2 * Math.PI)
        )}
        xAccessor={d => d.timestamp}
        yAccessor={d => d.value}
      >
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
      </DataProvider>
    </div>
  </>
);

rulerStory.story = {
  name: 'Ruler',
};

export const areaNoZoom = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart
      height={CHART_HEIGHT}
      onAreaDefined={area => {
        action('Area defined')(area);
      }}
    />
  </DataProvider>
);

areaNoZoom.story = {
  name: 'Area (no zoom)',
};

export const areaXZoom = () => {
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
        >
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" />
          <LineChart height={CHART_HEIGHT} onAreaDefined={this.onAreaDefined} />
        </DataProvider>
      );
    }
  }
  return <ZoomByArea />;
};

areaXZoom.story = {
  name: 'Area (x-zoom)',
};

export const areaHoldShiftToEnable = () => {
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
        <>
          <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
            <Series id="1" color="steelblue" />
            <Series id="2" color="maroon" />
            <LineChart
              height={CHART_HEIGHT}
              onAreaDefined={enableArea ? this.onAreaDefined : null}
            />
          </DataProvider>
          (You might need to click here first)
        </>
      );
    }
  }
  return <OnDemandArea />;
};

areaHoldShiftToEnable.story = {
  name: 'Area (hold shift to enable)',
};

export const persistentFixedAreaHoldShiftToEnable = () => {
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
        <>
          <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
            <Series id="1" color="steelblue" />
            <Series id="2" color="maroon" />
            <LineChart
              height={CHART_HEIGHT}
              areas={area ? [area] : []}
              onAreaDefined={enableArea ? this.onAreaDefined : null}
            />
          </DataProvider>
          (You might need to click here first)
        </>
      );
    }
  }
  return <OnDemandArea />;
};

persistentFixedAreaHoldShiftToEnable.story = {
  name: 'Persistent fixed area (hold shift to enable)',
};

export const persistentFixedAreasClickToRemove = () => {
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
      const { areas } = this.state;
      action('Area clicked')(area, xpos, ypos);
      this.setState({
        areas: areas.filter(a => a.id !== area.id),
      });
      return true;
    };

    render() {
      const { areas } = this.state;
      return (
        <>
          <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
            <Series id="1" color="steelblue" />
            <Series id="2" color="maroon" />
            <LineChart
              height={CHART_HEIGHT}
              areas={areas}
              onAreaDefined={this.onAreaDefined}
              onAreaClicked={this.onAreaClicked}
            />
          </DataProvider>
          (You might need to click here first)
        </>
      );
    }
  }
  return <OnDemandArea />;
};

persistentFixedAreasClickToRemove.story = {
  name: 'Persistent fixed areas (click to remove)',
};

export const persistentFixedAreasClickOutsideToClear = () => {
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
        <>
          <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
            <Series id="1" color="steelblue" />
            <Series id="2" color="maroon" />
            <LineChart
              height={CHART_HEIGHT}
              areas={areas}
              onAreaDefined={this.onAreaDefined}
              onAreaClicked={this.onAreaClicked}
              onClick={this.onChartClicked}
            />
          </DataProvider>
          (You might need to click here first)
        </>
      );
    }
  }
  return <OnDemandArea />;
};

persistentFixedAreasClickOutsideToClear.story = {
  name: 'Persistent fixed areas (click outside to clear)',
};

export const persistentSeriesAreaHoldShiftToEnable = () => {
  // eslint-disable-next-line
  class OnDemandArea extends React.Component {
    state = { enableArea: false, areas: [] };

    componentDidMount() {
      d3.select('body').on('keydown', this.onKeyDown);
      d3.select('body').on('keyup', this.onKeyUp);
    }

    onAreaDefined = area => {
      const { areas } = this.state;
      const newAreas = [...areas];
      for (let i = 0; i < area.start.points.length; i += 1) {
        const newArea = {
          id: area.id,
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
        <>
          <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
            <Series id="1" color="steelblue" />
            <Series id="2" color="maroon" />
            <LineChart
              height={CHART_HEIGHT}
              areas={areas}
              onAreaDefined={enableArea ? this.onAreaDefined : null}
            />
          </DataProvider>
          (You might need to click here first)
        </>
      );
    }
  }
  return <OnDemandArea />;
};

persistentSeriesAreaHoldShiftToEnable.story = {
  name: 'Persistent series area (hold shift to enable)',
};

export const doubleClickEvents = () => (
  <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
    <Series id="1" color="steelblue" />
    <Series id="2" color="maroon" />
    <LineChart height={CHART_HEIGHT} onDoubleClick={action('onDoubleClick')} />
  </DataProvider>
);

doubleClickEvents.story = {
  name: 'Double-click events',
};

export const regressionOnMouseUp = () => {
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
      const { onAreaDefined } = this.state;
      this.setState({
        // eslint-disable-next-line no-console
        onAreaDefined: onAreaDefined ? null : console.log,
      });
    };

    render() {
      const { onAreaDefined } = this.state;
      return (
        <>
          <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
            <Series id="1" color="steelblue" />
            <Series id="2" color="maroon" />
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
        </>
      );
    }
  }
  return <OnMouseUp />;
};

regressionOnMouseUp.story = {
  name: 'Regression: onMouseUp',
};
