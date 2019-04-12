import React from 'react';
import { storiesOf } from '@storybook/react';
import RulerTooltip from '../build/src/components/RulerTooltip';

storiesOf('components/RulerTooltip', module)
  .addDecorator(story => (
    <svg width={500} height={500}>
      {story()}
    </svg>
  ))
  .add('Basic', () => <RulerTooltip label="Label" x={50} y={50} color="red" />)
  .add('Long text', () => (
    <RulerTooltip
      label="Some really really really really really really long text"
      x={50}
      y={50}
      color="red"
      labelHeight={20}
    />
  ))
  .add('Huge padding', () => (
    <RulerTooltip
      label="Some text"
      x={50}
      y={50}
      padding={30}
      color="red"
      labelHeight={20}
    />
  ))
  .add('Colors', () => (
    <RulerTooltip
      label="Some text"
      x={50}
      y={50}
      padding={30}
      color="black"
      labelHeight={20}
    />
  ));
