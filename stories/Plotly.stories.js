import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import moment from 'moment';
import Plot from 'react-plotly.js';
import { ContextChart, Griff, GriffContext, Series } from '../build/src';
import { staticLoader } from './loaders';

const staticXDomain = [+moment().subtract(1, 'week'), +moment()];

const seriesToPlotly = ({ color, data, timeSubDomain }) => {
  const filteredData = timeSubDomain
    ? data.filter(
        ({ timestamp }) =>
          timestamp >= timeSubDomain[0] && timestamp <= timeSubDomain[1]
      )
    : data;
  return {
    x: filteredData.map(({ timestamp }) => new Date(timestamp)),
    y: filteredData.map(({ y }) => y),
    type: 'scatter',
    mode: 'lines+points',
    marker: { color },
  };
};

storiesOf('integrations/Plotly', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('Basic', () => (
    <React.Fragment>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <GriffContext.Consumer>
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
        </GriffContext.Consumer>
      </Griff>
    </React.Fragment>
  ))
  .add('Controlled by ContextChart', () => (
    <React.Fragment>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <GriffContext.Consumer>
          {({ series }) => (
            <Plot
              data={series.map(s => seriesToPlotly(s))}
              layout={{
                width: '100%',
                height: 400,
                title: 'A Fancy Plot controlled by a ContextChart',
              }}
            />
          )}
        </GriffContext.Consumer>
        <ContextChart />
      </Griff>
    </React.Fragment>
  ))
  .add('Interacting with ContextChart', () => (
    <React.Fragment>
      <Griff loader={staticLoader} timeDomain={staticXDomain}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
        <GriffContext.Consumer>
          {({ series, updateDomains }) => (
            <Plot
              key={series.map(s => s.id).join('-')}
              data={series.map(s => seriesToPlotly(s))}
              layout={{
                width: '100%',
                height: 400,
                title: 'A Fancy Plot interacting with a ContextChart',
              }}
              onRelayout={input => {
                const {
                  'xaxis.range[0]': lowerTime,
                  'xaxis.range[1]': upperTime,
                  'xaxis.autorange': autorange,
                } = input;
                updateDomains(
                  series.reduce(
                    (update, { id, timeDomain }) => ({
                      ...update,
                      [id]: {
                        time: autorange
                          ? timeDomain
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
        </GriffContext.Consumer>
        <ContextChart />
      </Griff>
    </React.Fragment>
  ));
