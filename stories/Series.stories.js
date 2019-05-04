import React from 'react';
import { storiesOf } from '@storybook/react';
import { DataProvider, LineChart, Series } from '../build/src';

import { staticLoader } from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

/* eslint-disable react/no-multi-comp */
storiesOf('components/Series', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('Basic', () => (
    <DataProvider
      defaultLoader={staticLoader}
      timeDomain={staticXDomain}
      series={[]}
    >
      <Series id="1" />
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Change props', () => {
    const COLORS = {
      'steelblue-maroon': ['steelblue', 'maroon'],
      'orange-gray': ['orange', 'gray'],
    };

    class Stateful extends React.Component {
      state = {
        clicks: {},
      };

      onClick = (id, type) => () => {
        this.setState(({ clicks }) => ({
          clicks: {
            ...clicks,
            [id]: {
              ...clicks[id],
              [type]: this.getClicks(id, type) + 1,
            },
          },
        }));
      };

      getClicks = (id, type) => {
        const { clicks } = this.state;
        return +((clicks[id] || { [type]: 0 })[type] || 0);
      };

      render() {
        return (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
              }}
            >
              {Object.keys(COLORS).map(id => (
                <div key={id} style={{ textAlign: 'center', fontWeight: 700 }}>
                  {id}
                </div>
              ))}
              {Object.keys(COLORS).map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={this.onClick(id, 'color')}
                >
                  color
                </button>
              ))}
              {Object.keys(COLORS).map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={this.onClick(id, 'drawPoints')}
                >
                  drawPoints
                </button>
              ))}
              {Object.keys(COLORS).map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={this.onClick(id, 'pointWidth')}
                >
                  pointWidth
                </button>
              ))}
            </div>
            <DataProvider
              defaultLoader={staticLoader}
              timeDomain={staticXDomain}
              series={[]}
            >
              {Object.keys(COLORS).map(id => (
                <Series
                  key={id}
                  id={id}
                  color={
                    COLORS[id][this.getClicks(id, 'color') % COLORS[id].length]
                  }
                  drawPoints={Boolean(this.getClicks(id, 'drawPoints') % 2)}
                  pointWidth={(this.getClicks(id, 'pointWidth') % 10) + 3}
                />
              ))}
              <LineChart height={CHART_HEIGHT} />
            </DataProvider>
          </div>
        );
      }
    }
    return <Stateful />;
  });
