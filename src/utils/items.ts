import { BaseSeries } from '../internal';
import { firstDefined } from './cleaner';

export const combineItems = (
  base: BaseSeries,
  ...others: any[]
): BaseSeries => {
  const keys = Object.keys(base);
  return keys.reduce((acc, key) => {
    const candidates = others.map(({ [key]: value }) => value);
    const value = firstDefined(undefined, ...candidates);
    if (value === undefined) {
      return acc;
    }
    return {
      ...acc,
      [key]: value,
    };
  }, base);
};
