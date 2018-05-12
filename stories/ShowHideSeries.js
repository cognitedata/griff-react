import React from 'react';
import { baseConfig, defaultLoaderFactory, defaultSeries } from './';
import { DataProvider, ChartContainer, LineChart, ContextChart } from '../src';

export default class ShowHideSeries extends React.Component {
  state = { hiddenSeries: {} };
  loader = defaultLoaderFactory(defaultSeries);
  render() {
    const { hiddenSeries } = this.state;
    const series = defaultSeries;
    const tags = Object.keys(series);
    return (
      <div>
        <DataProvider
          config={baseConfig}
          margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
          height={800}
          width={1200}
          loader={this.loader}
          colors={{
            1: 'steelblue',
            2: 'maroon',
            3: 'black',
          }}
          hiddenSeries={hiddenSeries}
        >
          <ChartContainer>
            <LineChart heightPct={0.8} />
            <ContextChart heightPct={0.1} margin={{ top: 0.1 }} />
          </ChartContainer>
        </DataProvider>
        {tags.map(key => {
          const t = series[key];
          return (
            <button
              key={t.id}
              onClick={() => {
                this.setState({
                  hiddenSeries: {
                    ...hiddenSeries,
                    [t.id]: !hiddenSeries[t.id],
                  },
                });
              }}
            >
              {hiddenSeries[t.id] ? 'show' : 'hide'} {t.id}
            </button>
          );
        })}
      </div>
    );
  }
}
