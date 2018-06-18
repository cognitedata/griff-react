import React, { Component } from 'react';
import * as d3 from 'd3';
import { render } from 'react-dom';
import { DataProvider, LineChart } from '../../src';

const randomData = () => {
  const data = [];
  for (let i = 100; i > 0; i -= 1) {
    const timestamp = Date.now() - i * 100000;
    const value = Math.random();
    data.push({
      timestamp,
      value,
    });
  }
  return data;
};

const _baseDomain = d3.extent(randomData(), d => d.timestamp);
const loader = async ({ oldSeries, reason }) => {
  if (reason === 'MOUNTED') {
    return {
      data: randomData(),
    };
  }
  return {
    data: oldSeries.data,
  };
};

class App extends Component {
  state = {
    series: [
      {
        id: 1,
        color: 'steelblue',
        strokeWidth: 2.5,
      },
      {
        id: 2,
        color: 'maroon',
        strokeWidth: 1.5,
      },
    ],
    baseDomain: _baseDomain,
    zoomable: true,
  };

  componentDidMount() {
    window.series = this.state.series;
    window.dataProps = {};
    window.lineProps = {};
  }

  update = () => {
    this.setState({
      series: window.series || this.state.series || [],
      lineProps: window.lineProps || {},
      dataProps: window.dataProps || {},
    });
  };

  render() {
    const { series, baseDomain, zoomable, dataProps, lineProps } = this.state;
    return (
      <div style={{ height: '100vh' }}>
        <p>
          Edit the window.series, window.dataProps and window.lineProps
          variables and click <button onClick={this.update}>here</button> to
          update.{' '}
        </p>
        <DataProvider
          defaultLoader={loader}
          series={series}
          yAccessor={d => d.value}
          xAccessor={d => d.timestamp}
          yAxisWidth={50}
          baseDomain={baseDomain}
          {...dataProps}
        >
          <LineChart
            crosshair
            zoomable={zoomable}
            {...lineProps}
          />
        </DataProvider>
      </div>
    );
  }
}

render(<App />, document.querySelector('#demo'));
