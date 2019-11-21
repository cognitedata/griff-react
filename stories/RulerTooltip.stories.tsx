import React from 'react';
import RulerTooltip from '../src/components/RulerTooltip';

const CHART_WIDTH = 500;
const CHART_HEIGHT = 500;

type StoryProps = {
  options: {
    x: number;
  };
};

export default {
  title: 'Demo|components/RulerTooltip',

  decorators: [
    (story: React.FC<StoryProps>) => {
      class FakeChart extends React.Component {
        state = {
          x: CHART_WIDTH / 2,
        };

        onMouseMove = ({ nativeEvent: { offsetX } }: React.MouseEvent) => {
          this.setState({ x: offsetX });
        };

        render() {
          const { x } = this.state;
          return (
            <svg
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              style={{ outline: '1px solid #AAA' }}
              onMouseMove={this.onMouseMove}
            >
              {story({ options: { x } })}
              <line
                y1={0}
                y2={CHART_HEIGHT}
                stroke="#ccc"
                strokeWidth="1"
                x1={x}
                x2={x}
              />
            </svg>
          );
        }
      }
      return <FakeChart />;
    },
  ],
};

export const basic = ({ options: { x } }: StoryProps) => (
  <RulerTooltip
    label="Label"
    x={x}
    y={50}
    color="red"
    chartWidth={CHART_WIDTH}
  />
);

export const longText = ({ options: { x } }: StoryProps) => (
  <RulerTooltip
    label="Some really really really really really really long text"
    x={x}
    y={50}
    color="red"
    labelHeight={20}
    chartWidth={CHART_WIDTH}
  />
);

longText.story = {
  name: 'Long text',
};

export const hugePadding = ({ options: { x } }: StoryProps) => (
  <RulerTooltip
    label="Some text"
    x={x}
    y={50}
    padding={100}
    color="red"
    labelHeight={20}
    chartWidth={CHART_WIDTH}
  />
);

hugePadding.story = {
  name: 'Huge padding',
};

export const colors = ({ options: { x } }: StoryProps) => (
  <>
    <RulerTooltip
      label="sample"
      x={x}
      y={20}
      color="orange"
      labelHeight={20}
      chartWidth={CHART_WIDTH}
    />
    <RulerTooltip
      label="sample sample"
      x={x}
      y={60}
      color="black"
      labelHeight={20}
      chartWidth={CHART_WIDTH}
    />
    <RulerTooltip
      label="sample sample sample"
      x={x}
      y={100}
      color="red"
      labelHeight={20}
      chartWidth={CHART_WIDTH}
    />
  </>
);
