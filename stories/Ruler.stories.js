import React from 'react';
import moment from 'moment';
import Ruler from '../src/components/Ruler';

export default {
  title: 'components/Ruler',

  decorators: [
    story => (
      <svg width={500} height={300} style={{ outline: '1px solid #aaa' }}>
        {story()}
      </svg>
    ),
  ],
};

export const invisible = () => (
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
);

export const basic = () => (
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
);

export const timeLabelStory = () => (
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
);

timeLabelStory.story = {
  name: 'timeLabel',
};

export const yLabelStory = () => (
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
);

yLabelStory.story = {
  name: 'yLabel',
};

export const getTimeLabelPositionStory = () => (
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
);

getTimeLabelPositionStory.story = {
  name: 'getTimeLabelPosition',
};
