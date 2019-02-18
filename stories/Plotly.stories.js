import React from 'react';
import 'react-select/dist/react-select.css';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import moment from 'moment';
import Plot from 'react-plotly.js';
import { ContextChart, DataProvider, ScalerContext } from '../src';
import { staticLoader } from './loaders';

const staticXDomain = [+moment().subtract(1, 'week'), +moment()];

const seriesToPlotly = ({ color, data, id }, subDomainsByItemId) => {
  const filteredData =
    subDomainsByItemId && subDomainsByItemId[id] && subDomainsByItemId[id].time
      ? data.filter(({ timestamp }) => {
          const timeSubDomain = subDomainsByItemId[id].time;
          return timestamp >= timeSubDomain[0] && timestamp <= timeSubDomain[1];
        })
      : data;
  return {
    x: filteredData.map(({ timestamp }) => new Date(timestamp)),
    y: filteredData.map(({ value }) => value),
    type: 'scatter',
    mode: 'lines+points',
    marker: { color },
  };
};

storiesOf('Plotly.js', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('Basic', () => (
    <React.Fragment>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
      >
        <ScalerContext.Consumer>
          {({ series }) => (
            <Plot
              data={series.map(s => seriesToPlotly(s))}
              layout={{
                width: '100%',
                height: 400,
                title: 'A Fancy Plot',
              }}
            />
          )}
        </ScalerContext.Consumer>
      </DataProvider>
    </React.Fragment>
  ))
  .add('Controlled by ContextChart', () => (
    <React.Fragment>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
      >
        <ScalerContext.Consumer>
          {({ series, subDomainsByItemId }) => (
            <Plot
              data={series.map(s => seriesToPlotly(s, subDomainsByItemId))}
              layout={{
                width: '100%',
                height: 400,
                title: 'A Fancy Plot controlled by a ContextChart',
              }}
            />
          )}
        </ScalerContext.Consumer>
        <ContextChart />
      </DataProvider>
    </React.Fragment>
  ))
  .add('Interacting with ContextChart', () => (
    <React.Fragment>
      <DataProvider
        defaultLoader={staticLoader}
        timeDomain={staticXDomain}
        series={[{ id: 1, color: 'steelblue' }, { id: 2, color: 'maroon' }]}
      >
        <ScalerContext.Consumer>
          {({ series, domainsByItemId, subDomainsByItemId, updateDomains }) => (
            <Plot
              data={series.map(s => seriesToPlotly(s, subDomainsByItemId))}
              layout={{
                width: '100%',
                height: 400,
                title: 'A Fancy Plot controlled by a ContextChart',
              }}
              onSelected={action('onSelected')}
              onRelayout={input => {
                const {
                  'xaxis.range[0]': lowerTime,
                  'xaxis.range[1]': upperTime,
                  'xaxis.autorange': autorange,
                } = input;
                updateDomains(
                  series.reduce(
                    (update, { id }) => ({
                      ...update,
                      [id]: {
                        time: autorange
                          ? domainsByItemId[id].time
                          : [lowerTime, upperTime].map(d =>
                              new Date(d).getTime()
                            ),
                      },
                    }),
                    {}
                  ),
                  action('updateDomains')
                );
              }}
            />
          )}
        </ScalerContext.Consumer>
        <ContextChart />
      </DataProvider>
    </React.Fragment>
  ));
