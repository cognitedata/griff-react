import React from 'react';
import { storiesOf } from '@storybook/react';
import {
  DataProvider,
  LineChart,
  Series,
  AxisPlacement,
  AxisDisplayMode,
} from '../build/src';

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
    <DataProvider defaultLoader={staticLoader} timeDomain={staticXDomain}>
      <Series id="1" />
      <LineChart height={CHART_HEIGHT} />
    </DataProvider>
  ))
  .add('Change props', () => {
    const pointRenderer = (
      d,
      i,
      arr,
      { x, y, color, opacity, opacityAccessor }
    ) => {
      const width = Math.floor(((d.value * 100) % 5) + 3);
      return (
        <circle
          key={`${x}-${y}`}
          className="point"
          r={width / 2}
          opacity={opacityAccessor ? opacityAccessor(d, i, arr) : opacity}
          cx={x}
          cy={y}
          fill={color}
        />
      );
    };
    pointRenderer.toString = () => 'custom renderer';

    const pointWidthAccessor = d => Math.floor(((d.value * 100) % 5) + 3);
    pointWidthAccessor.toString = () => 'custom widths';

    const opacityAccessor = d => ((d.value * 100) % 100) / 100;
    opacityAccessor.toString = () => 'custom opacity';

    const SERIES_IDS = ['first', 'second'];
    const OPTIONS = {
      color: ['maroon', 'steelblue', 'darkgreen', 'lightsalmon'],
      drawLines: [true, false],
      drawPoints: [true, false, pointRenderer],
      pointWidth: [4, 6, 8, 10],
      pointWidthAccessor: [pointWidthAccessor],
      opacity: [0.25, 0.5, 0.75, 1],
      opacityAccessor: [opacityAccessor],
      strokeWidth: [1, 2, 3, 4, 5, 6],
      hidden: [true, false],
      step: [true, false],
      zoomable: [true, false],
      name: ['readable-name'],
      yDomain: [[-1, 2], [0, 10], [0.25, 0.75]],
      ySubDomain: [[-1, 2], [0, 10], [0.25, 0.75]],
      yAxisPlacement: [
        AxisPlacement.LEFT,
        AxisPlacement.RIGHT,
        AxisPlacement.BOTH,
        AxisPlacement.UNSPECIFIED,
      ],
      yAxisDisplayMode: [
        AxisDisplayMode.ALL,
        AxisDisplayMode.COLLAPSED,
        AxisDisplayMode.NONE,
      ],
    };

    class Stateful extends React.Component {
      state = {};

      setProperty = (id, key, value) => () => {
        this.setState(state => ({
          [key]: {
            ...state[key],
            [id]: value,
          },
        }));
      };

      renderToggles = key => {
        const { [key]: values = {} } = this.state;
        return SERIES_IDS.map(id => (
          <div
            key={id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: '0.5em',
              paddingTop: '0.5em',
              borderTop: '1px solid #aaa',
            }}
          >
            {OPTIONS[key].map(value => (
              <button
                key={`${key}-${value}`}
                disabled={values[id] === value}
                type="button"
                onClick={this.setProperty(id, key, value)}
              >
                {String(value)}
              </button>
            ))}
            <button
              disabled={values[id] === undefined}
              type="button"
              onClick={this.setProperty(id, key, undefined)}
            >
              reset to default
            </button>
          </div>
        ));
      };

      renderPropertyTable = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr' }}>
          <div style={{ textAlign: 'center' }}>prop</div>
          {SERIES_IDS.map(id => (
            <div
              key={id}
              style={{
                textAlign: 'center',
              }}
            >
              {id}
            </div>
          ))}
          {Object.keys(OPTIONS).map(option => (
            <React.Fragment key={option}>
              <div
                key={option}
                style={{
                  textAlign: 'right',
                  paddingRight: '0.5em',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  marginTop: '0.5em',
                  paddingTop: '0.5em',
                  borderTop: '1px solid #aaa',
                  fontFamily: 'monospace',
                }}
              >
                {option}
              </div>
              {this.renderToggles(option)}
            </React.Fragment>
          ))}
        </div>
      );

      render() {
        return (
          <div>
            <DataProvider
              defaultLoader={staticLoader}
              timeDomain={staticXDomain}
            >
              {SERIES_IDS.map(id => {
                const options = Object.keys(OPTIONS).reduce((acc, option) => {
                  const { [option]: values = {} } = this.state;
                  return {
                    ...acc,
                    [option]: values[id],
                  };
                }, {});
                return <Series key={id} id={id} {...options} />;
              })}
              <LineChart height={CHART_HEIGHT} />
            </DataProvider>
            {this.renderPropertyTable()}
          </div>
        );
      }
    }
    return <Stateful />;
  });
