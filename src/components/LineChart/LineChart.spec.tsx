import React from 'react';
import { render, waitForElement } from '@testing-library/react';
import { Base } from './LineChart.stories';

describe('LineChart', () => {
  it('should base render correctly', async () => {
    const { asFragment, queryByTestId } = render(<Base />);

    await waitForElement(() => queryByTestId('Line-1'));
    expect(asFragment()).toMatchSnapshot();
  });
});
