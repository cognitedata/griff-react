import React from 'react';
import { randomData, baseConfig } from './';
import { DataProvider, ChartContainer, LineChart, ContextChart } from '../src';

export default class Wrapper extends React.Component {
  state = { showTimeline: true };
  series = {
    1: { data: randomData(), id: 1 },
    2: { data: randomData(), id: 2 },
    3: { data: randomData(), id: 3 },
  };
  loader = () => this.series;
  config = {
    ...baseConfig,
  };

  render() {
    const { showTimeline } = this.state;
    return (
      <div>
        <DataProvider
          config={this.config}
          margin={{ top: 50, bottom: 10, left: 20, right: 10 }}
          height={500}
          width={800}
          loader={this.loader}
          colors={{
            1: 'red',
            2: 'green',
            3: 'blue',
          }}
        >
          <ChartContainer>
            <LineChart heightPct={showTimeline ? 0.85 : 1} crosshairs />
            {showTimeline ? (
              <ContextChart heightPct={0.1} margin={{ top: 0.05 }} />
            ) : null}
          </ChartContainer>
        </DataProvider>
        <button onClick={() => this.setState({ showTimeline: !showTimeline })}>
          Toggle
        </button>
      </div>
    );
  }
}
