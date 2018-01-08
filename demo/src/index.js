import React, { Component } from 'react';
import * as d3 from 'd3';
import Promise from 'bluebird';
import { render } from 'react-dom';
import {
  DataProvider,
  ChartContainer,
  LineChart,
  ContextChart
} from '../../src';

const randomData = () => {
  const data = [];
  for (let i = 500; i > 0; i--) {
    const timestamp = Date.now() - i * 1000;
    const value = Math.random();
    data.push({
      timestamp,
      value
    });
  }
  return data;
};

const loader = () => {
  const series = {
    1: { data: randomData(), id: 1 },
    2: { data: randomData(), id: 2 }
  };
  return (domain, subDomain, config, oldSeries, reason) => {
    if (reason === 'MOUNTED') {
      return series;
    }
    return oldSeries;
  };
};

const config = {
  yAxis: {
    mode: 'every',
    width: 50,
    accessor: d => d.value,
    calculateDomain: data => d3.extent(data, d => d.value)
  },
  xAxis: {
    accessor: d => d.timestamp,
    calculateDomain: data => d3.extent(data, d => d.timestamp)
  },
  baseDomain: d3.extent(randomData(), d => d.timestamp)
};

// const Tooltip = ({ xpos, ypos, points }) => (

// )

class App extends Component {
  state = {
    loader: loader()
  };

  onMouseMove = points => {
    console.log(points);
  };

  render() {
    return (
      <DataProvider
        width={1200}
        height={800}
        margin={{ top: 50, right: 50, left: 50, bottom: 50 }}
        config={config}
        loader={this.state.loader}
      >
        <ChartContainer
          colors={{
            1: 'steelblue',
            2: 'maroon'
          }}
        >
          <LineChart heightPct={0.8} onMouseMove={this.onMouseMove} />
          <ContextChart heightPct={0.05} margin={{ top: 0.04 }} />
        </ChartContainer>
      </DataProvider>
    );
  }
}

render(<App />, document.querySelector('#demo'));
