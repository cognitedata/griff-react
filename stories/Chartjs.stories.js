import React from 'react';
import { storiesOf } from '@storybook/react';
import moment from 'moment';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ContextChart, Griff, GriffContext, Series } from '../build/src';
import { staticLoader } from './loaders';

const staticXDomain = [+moment().subtract(1, 'week'), +moment()];

storiesOf('integrations/ChartJS', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('Bar', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <GriffContext.Consumer>
        {({ series }) => (
          <Bar
            data={{
              labels: [
                '0.0',
                '0.1',
                '0.2',
                '0.3',
                '0.4',
                '0.5',
                '0.6',
                '0.7',
                '0.8',
                '0.9',
              ],
              datasets: series.map(s => {
                const { timeSubDomain } = s;
                const groupedData = s.data
                  .filter(
                    ({ timestamp }) =>
                      timestamp >= timeSubDomain[0] &&
                      timestamp <= timeSubDomain[1]
                  )
                  .reduce((acc, datapoint) => {
                    const updated = [...acc];
                    const index = Math.floor(datapoint.y * 10);
                    updated[index] = (acc[index] || 0) + 1;
                    return updated;
                  }, []);
                return {
                  label: s.id,
                  data: groupedData,
                  backgroundColor: groupedData.map(() => s.color),
                  borderColor: groupedData.map(() => s.color),
                  borderWidth: 1,
                };
              }),
            }}
          />
        )}
      </GriffContext.Consumer>
      <ContextChart />
    </Griff>
  ))
  .add('Doughnut', () => (
    <Griff loader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <GriffContext.Consumer>
        {({ series }) => (
          <Doughnut
            data={{
              labels: [
                '0.0',
                '0.1',
                '0.2',
                '0.3',
                '0.4',
                '0.5',
                '0.6',
                '0.7',
                '0.8',
                '0.9',
              ],
              datasets: series.map(s => {
                const { timeSubDomain } = s;
                const groupedData = s.data
                  .filter(
                    ({ timestamp }) =>
                      timestamp >= timeSubDomain[0] &&
                      timestamp <= timeSubDomain[1]
                  )
                  .reduce((acc, datapoint) => {
                    const updated = [...acc];
                    const index = Math.floor(datapoint.y * 10);
                    updated[index] = (acc[index] || 0) + 1;
                    return updated;
                  }, []);
                const color = { 1: '70, 130, 180', 2: '128, 0, 0' }[s.id];
                return {
                  label: s.id,
                  data: groupedData,
                  backgroundColor: groupedData.map(() => `rgb(${color}, 0.3)`),
                  borderColor: groupedData.map(() => s.color),
                  borderWidth: 1,
                };
              }),
            }}
          />
        )}
      </GriffContext.Consumer>
      <ContextChart />
    </Griff>
  ));
