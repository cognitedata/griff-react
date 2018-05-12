import React from 'react';
import { Slider } from 'antd';
import { randomData, baseConfig } from './';
import { DataProvider, ChartContainer, LineChart, ContextChart } from '../src';

export default class Wrapper extends React.Component {
  state = { showTimeline: true, strokeWidths: {} };
  series = {
    1: { data: randomData(), id: 1 },
    2: { data: randomData(), id: 2 },
    3: { data: randomData(), id: 3 },
  };
  baseLoader = () => () => this.series;
  loader = this.baseLoader();
  config = {
    ...baseConfig,
  };

  render() {
    const { showTimeline, strokeWidths } = this.state;
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
          strokeWidths={strokeWidths}
        >
          <ChartContainer>
            <LineChart heightPct={showTimeline ? 0.85 : 1} crosshairs />
            <ContextChart heightPct={0.1} margin={{ top: 0.05 }} />
          </ChartContainer>
        </DataProvider>
        {Object.keys(this.series).map(key => (
          <Slider
            key={`slider-${key}`}
            min={1}
            max={10}
            step={0.25}
            onChange={value => {
              const copy = { ...strokeWidths };
              copy[key] = value;
              this.setState({
                strokeWidths: copy,
              });
            }}
            value={strokeWidths[key] || 1}
          />
        ))}
      </div>
    );
  }
}
