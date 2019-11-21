import React from 'react';
import { render, wait } from '@testing-library/react';
import { Base } from './LineChart.stories';

const DEFAULT_SIZE = { width: 1000, height: 500 };

describe('LineChart', () => {
  it('should base render correctly', async () => {
    const { asFragment, queryAllByTestId } = render(
      <Base size={DEFAULT_SIZE} />
    );

    await wait(() => {
      expect(queryAllByTestId('Line-1')).toHaveLength(2);
      expect(queryAllByTestId('xAxis')).toHaveLength(2);
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
