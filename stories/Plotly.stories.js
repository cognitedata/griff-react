import React from 'react';
import { action } from '@storybook/addon-actions';
import moment from 'moment';
import Plot from 'react-plotly.js';
import { ContextChart, DataProvider, ScalerContext, Series } from '../src';
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

export default {
  title: 'Demo|integrations/Plotly',

  decorators: [
    story => (
      <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
        {story()}
      </div>
    ),
  ],
};

export const basic = () => (
  <>
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <ScalerContext.Consumer>
        {({ series }) => (
          <Plot
            data={series.map(s => seriesToPlotly(s))}
            layout={{
              width: '100%',
              height: 400,
              title: 'Demo|A Fancy Plot',
            }}
          />
        )}
      </ScalerContext.Consumer>
    </DataProvider>
  </>
);

export const controlledByContextChart = () => (
  <>
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <ScalerContext.Consumer>
        {({ series, subDomainsByItemId }) => (
          <Plot
            data={series.map(s => seriesToPlotly(s, subDomainsByItemId))}
            layout={{
              width: '100%',
              height: 400,
              title: 'Demo|A Fancy Plot controlled by a ContextChart',
            }}
          />
        )}
      </ScalerContext.Consumer>
      <ContextChart />
    </DataProvider>
  </>
);

controlledByContextChart.story = {
  name: 'Controlled by ContextChart',
};

export const interactingWithContextChart = () => (
  <>
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <ScalerContext.Consumer>
        {({ series, domainsByItemId, subDomainsByItemId, updateDomains }) => (
          <Plot
            key={series.map(s => s.id).join('-')}
            data={series.map(s => seriesToPlotly(s, subDomainsByItemId))}
            layout={{
              width: '100%',
              height: 400,
              title: 'Demo|A Fancy Plot interacting with a ContextChart',
            }}
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
  </>
);

interactingWithContextChart.story = {
  name: 'Interacting with ContextChart',
};
