import React from 'react';
import { render, wait } from '@testing-library/react';
import { Base, MultiSeries } from './stories/Scatterplot.stories';
import { CustomXAxisFormatter } from './stories/props/xAxisFormatter.stories';
import { CustomYAxisFormatter } from './stories/props/yAxisFormatter.stories';

describe('Scatterplot', () => {
  it('should render base correctly', async () => {
    const { asFragment, getAllByTestId, getByTestId } = render(<Base />);

    await wait(() => {
      expect(
        getByTestId('Points-Series-1').querySelectorAll('circle')
      ).toHaveLength(100);
    });
    expect(getAllByTestId('xAxis')).toHaveLength(1);
    expect(getByTestId('yAxis-Series-1')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render multiple series correctly', async () => {
    const { asFragment, getAllByTestId, getByTestId } = render(<MultiSeries />);

    await wait(() => {
      expect(
        getByTestId('Points-Series-1').querySelectorAll('circle')
      ).toHaveLength(100);
      expect(
        getByTestId('Points-Series-2').querySelectorAll('circle')
      ).toHaveLength(125);
    });
    expect(getAllByTestId('xAxis')).toHaveLength(1);
    expect(getByTestId('yAxis-Series-1')).toBeInTheDocument();
    expect(getByTestId('yAxis-Series-2')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  describe('Prop snapshots', () => {
    it('should render xAxisFormatter prop stories correctly', async () => {
      const customXAxisFormatter = render(<CustomXAxisFormatter />);
      await wait(() => {
        expect(
          customXAxisFormatter
            .getAllByTestId('Points-Series-1')[0]
            .querySelectorAll('circle')
        ).toHaveLength(100);
      });
      expect(customXAxisFormatter.asFragment()).toMatchSnapshot(
        'xAxisFormatter'
      );
    });

    it('should render yAxisFormatter prop stories correctly', async () => {
      const customYAxisFormatter = render(<CustomYAxisFormatter />);
      await wait(() => {
        expect(
          customYAxisFormatter
            .getAllByTestId('Points-Series-1')[0]
            .querySelectorAll('circle')
        ).toHaveLength(100);
      });
      expect(customYAxisFormatter.asFragment()).toMatchSnapshot(
        'yAxisFormatter'
      );
    });
  });
});
