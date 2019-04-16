import React from 'react';
import { storiesOf } from '@storybook/react';
import moment from 'moment';
import Ruler from '../build/src/components/Ruler';

storiesOf('components/Ruler', module)
  .addDecorator(story => (
    <svg width={500} height={300} style={{ outline: '1px solid #aaa' }}>
      {story()}
    </svg>
  ))
  .add('Invisible', () => (
    <Ruler
      chartWidth={500}
      chartHeight={300}
      points={[
        { name: 'one', color: 'maroon', timestamp: Date.now(), x: 50, y: 150 },
      ]}
      ruler={{
        visible: false,
      }}
    />
  ))
  .add('Basic', () => (
    <Ruler
      chartWidth={500}
      chartHeight={300}
      points={[
        {
          name: 'one',
          color: 'maroon',
          timestamp: Date.now(),
          value: 100,
          x: 50,
          y: 150,
        },
      ]}
      ruler={{}}
    />
  ))
  .add('timeLabel', () => (
    <Ruler
      chartWidth={500}
      chartHeight={300}
      points={[
        {
          name: 'one',
          color: 'maroon',
          timestamp: Date.now(),
          value: 100,
          x: 50,
          y: 150,
        },
      ]}
      ruler={{
        timeLabel: data => moment(+data.timestamp).format('LLL'),
      }}
    />
  ))
  .add('yLabel', () => (
    <Ruler
      chartWidth={500}
      chartHeight={300}
      points={[
        {
          name: 'one',
          color: 'maroon',
          timestamp: Date.now(),
          value: 100,
          x: 50,
          y: 150,
        },
      ]}
      ruler={{
        yLabel: data => Number(data.value).toFixed(6),
      }}
    />
  ))
  .add('getTimeLabelPosition', () => (
    <Ruler
      chartWidth={500}
      chartHeight={300}
      points={[
        {
          name: 'one',
          color: 'maroon',
          timestamp: Date.now(),
          value: 100,
          x: 50,
          y: 150,
        },
      ]}
      ruler={{
        getTimeLabelPosition: defaultPosition => defaultPosition - 200,
      }}
    />
  ));
