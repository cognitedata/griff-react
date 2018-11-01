import React, { Component } from 'react';
import * as d3 from 'd3';
import { render } from 'react-dom';
import moment from 'moment';
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

const X_DOMAIN = d3.extent(randomData(), d => d.timestamp);
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
    xDomain: X_DOMAIN,
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
    const { series, xDomain, zoomable, dataProps, lineProps } = this.state;
    return (
      <div>
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
          timeDomain={xDomain}
          {...dataProps}
        >
          <LineChart
            crosshair
            height={500}
            zoomable={zoomable}
            {...lineProps}
            ruler={{
              visible: true,
              yLabel: point => Number.parseFloat(point.value).toFixed(3),
              timeLabel: point =>
                moment(point.timestamp).format('DD-MM-YYYY HH:mm:ss'),
            }}
          />
        </DataProvider>
      </div>
    );
  }
}

render(<App />, document.querySelector('#demo'));
