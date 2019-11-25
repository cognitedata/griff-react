import React from 'react';
import { render, wait } from '@testing-library/react';
import { Base, MultiSeries, MultiSeriesCollection } from './LineChart.stories';

const DEFAULT_SIZE = { width: 1000, height: 500 };

describe('LineChart', () => {
  it('should base render correctly', async () => {
    const {
      asFragment,
      getAllByTestId,
      queryAllByTestId,
      getByTestId,
    } = render(<Base size={DEFAULT_SIZE} />);

    await wait(() => {
      expect(queryAllByTestId('Line-Series-1')).toHaveLength(2);
    });
    expect(getAllByTestId('xAxis')).toHaveLength(2);
    expect(getByTestId('yAxis-Series-1')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render multiple series correctly', async () => {
    const {
      asFragment,
      getAllByTestId,
      queryAllByTestId,
      getByTestId,
    } = render(<MultiSeries size={DEFAULT_SIZE} />);

    await wait(() => {
      expect(queryAllByTestId('Line-Series-1')).toHaveLength(2);
      expect(queryAllByTestId('Line-Series-2')).toHaveLength(2);
      expect(queryAllByTestId('Line-Series-3')).toHaveLength(2);
    });
    expect(getAllByTestId('xAxis')).toHaveLength(2);
    expect(getByTestId('yAxis-Series-1')).toBeInTheDocument();
    expect(getByTestId('yAxis-Series-2')).toBeInTheDocument();
    expect(getByTestId('yAxis-Series-3')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render multiple series in a single collection correctly', async () => {
    const {
      asFragment,
      getAllByTestId,
      queryAllByTestId,
      getByTestId,
      queryByTestId,
    } = render(<MultiSeriesCollection size={DEFAULT_SIZE} />);

    await wait(() => {
      expect(queryAllByTestId('Line-Series-1')).toHaveLength(2);
      expect(queryAllByTestId('Line-Series-2')).toHaveLength(2);
      expect(queryAllByTestId('Line-Series-3')).toHaveLength(2);
    });
    expect(getAllByTestId('xAxis')).toHaveLength(2);
    expect(getByTestId('yAxis-Collection-1')).toBeInTheDocument();
    expect(queryByTestId('yAxis-Series-1')).not.toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});
