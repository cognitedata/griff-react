import React from 'react';
import { render, wait } from '@testing-library/react';
import {
  Base,
  MultiSeries,
  MultiSeriesCollection,
} from './stories/LineChart.stories';
import { CustomXAxisHeight } from './stories/props/xAxisHeight.stories';
import { CustomYAxisWidth } from './stories/props/yAxisWidth.stories';
import {
  DisplayModeCollapsed,
  DisplayModeNone,
} from './stories/props/yAxisDisplayMode.stories';
import {
  XAxisPlacementTop,
  XAxisPlacementBoth,
} from './stories/props/xAxisPlacement.stories';
import { CustomXAxisFormatter } from './stories/props/xAxisFormatter.stories';
import { CustomYAxisFormatter } from './stories/props/yAxisFormatter.stories';
import { CustomYAxisTicks } from './stories/props/yAxisTicks.stories';

describe('LineChart', () => {
  it('should render base correctly', async () => {
    const {
      asFragment,
      getAllByTestId,
      queryAllByTestId,
      getByTestId,
    } = render(<Base />);

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
    } = render(<MultiSeries />);

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
    } = render(<MultiSeriesCollection />);

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

  it('should render all prop stories correctly', () => {
    // xAxisHeight
    const xAxisHeight = render(<CustomXAxisHeight />);
    expect(xAxisHeight.asFragment()).toMatchSnapshot('xAxisHeight');

    // yAxisWidth
    const yAxisWidth = render(<CustomYAxisWidth />);
    expect(yAxisWidth.asFragment()).toMatchSnapshot('yAxisWidth');

    // xAxisDisplayMode
    const xAxisDisplayModeCollapsed = render(<DisplayModeCollapsed />);
    expect(xAxisDisplayModeCollapsed.asFragment()).toMatchSnapshot(
      'xAxisDisplayMode - Collapsed'
    );
    const xAxisDisplayModeNone = render(<DisplayModeNone />);
    expect(xAxisDisplayModeNone.asFragment()).toMatchSnapshot(
      'xAxisDisplayMode - None'
    );

    // xAxisPlacement
    const xAxisPlacementTop = render(<XAxisPlacementTop />);
    expect(xAxisPlacementTop.asFragment()).toMatchSnapshot(
      'xAxisPlacement - Top'
    );
    const xAxisPlacementBoth = render(<XAxisPlacementBoth />);
    expect(xAxisPlacementBoth.asFragment()).toMatchSnapshot(
      'xAxisPlacement - Both'
    );

    // xAxisFormatter
    const customXAxisFormatter = render(<CustomXAxisFormatter />);
    expect(customXAxisFormatter.asFragment()).toMatchSnapshot('xAxisFormatter');

    // yAxisFormatter
    const customYAxisFormatter = render(<CustomYAxisFormatter />);
    expect(customYAxisFormatter.asFragment()).toMatchSnapshot('yAxisFormatter');

    // yAxisTicks
    const customYAxisTicks = render(<CustomYAxisTicks />);
    expect(customYAxisTicks.asFragment()).toMatchSnapshot('yAxitTicks');
  });
});
