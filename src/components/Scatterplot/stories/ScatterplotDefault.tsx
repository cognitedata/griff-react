import React from 'react';
import Scatterplot from '..';
import { ScatterplotProps } from '../types';
import { DEFAULT_HEIGHT, DEFAULT_SIZE } from './constants';

const ScatterplotDefault = (props: Partial<ScatterplotProps>) => {
  return <Scatterplot height={DEFAULT_HEIGHT} size={DEFAULT_SIZE} {...props} />;
};

export default ScatterplotDefault;
