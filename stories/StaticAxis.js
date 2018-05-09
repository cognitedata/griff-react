import React, { Component } from 'react';
import * as d3 from 'd3';
import { DataProvider, LayoutManager, LineChart, ContextChart } from '../src';
import { Map } from 'immutable';

const randomData = () => {
  const data = [];
  for (let i = 250; i > 0; i--) {
    const timestamp = Date.now() - i * 100000000;
    const value = Math.random();
    data.push({
      timestamp,
      value,
    });
  }
  return data;
};

const baseConfig = {
  yAxis: {
    mode: 'every',
    accessor: d => d.value,
    width: 50,
  },
  xAxis: {
    accessor: d => d.timestamp,
    calculateDomain: data => d3.extent(d => d.timestamp),
  },
  baseDomain: d3.extent(randomData(), d => d.timestamp),
};

const loader = () => {
  const series = {
    1: { data: randomData(), id: 1 },
    2: { data: randomData(), id: 2 },
    3: { data: randomData(), id: 3 },
  };
  return () => series;
};

const theLoader = loader();

class StaticAxis extends Component {
  state = {
    statics: Map(),
  };

  render() {
    const { statics } = this.state;
    return (
      <div>
        <DataProvider
          config={{
            ...baseConfig,
            yAxis: {
              accessor: d => d.value,
              staticDomain: statics.toJS(),
              width: 50,
            },
          }}
          margin={{ top: 50, bottom: 10, left: 20, right: 10 }}
          height={500}
          width={800}
          loader={theLoader}
          colors={{ 1: 'red', 2: 'green', 3: 'blue' }}
        >
          <LayoutManager>
            <LineChart heightPct={1} crosshairs />
          </LayoutManager>
        </DataProvider>
        {[1, 2, 3].map(i => (
          <button
            key={i}
            onClick={() => {
              const current = statics[i];
              let newMap;
              if (statics.get(i)) {
                newMap = statics.delete(i);
              } else {
                newMap = statics.set(i, [-0.5, 1.5]);
              }
              this.setState({
                statics: newMap,
              });
            }}
          >
            {statics.get(i) ? `${i}: set dynamic` : `${i}: set static`}
          </button>
        ))}
      </div>
    );
  }
}

export default StaticAxis;
