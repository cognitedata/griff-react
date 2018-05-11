import React from 'react';
import { baseConfig, randomData } from './';
import { DataProvider, ChartContainer, LineChart } from '../src';

export default class ToggleZooming extends React.Component {
  state = { zoomable: true };
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
    const { zoomable } = this.state;
    const configCopy = {
      ...baseConfig,
      zoomable,
    };
    return (
      <div>
        <DataProvider
          config={configCopy}
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
            <LineChart heightPct={1} crosshairs />
          </ChartContainer>
        </DataProvider>
        <button onClick={() => this.setState({ zoomable: !zoomable })}>
          Toggle
        </button>
      </div>
    );
  }
}
