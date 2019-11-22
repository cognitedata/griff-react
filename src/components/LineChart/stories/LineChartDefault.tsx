import React from 'react';
import LineChart from '..';
import { LineChartProps } from '../types';
import { DEFAULT_HEIGHT, DEFAULT_SIZE } from './constants';

const LineChartDefault = (props: Partial<LineChartProps>) => {
  return <LineChart height={DEFAULT_HEIGHT} size={DEFAULT_SIZE} {...props} />;
};

export default LineChartDefault;
