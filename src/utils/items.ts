import { BaseSeries } from '../internal';
import { firstDefined, mostSpecific } from './cleaner';

export const combineItems = (
  base: BaseSeries,
  ...others: any[]
): BaseSeries => {
  const keys = Object.keys(base);
  return keys.reduce((acc, key) => {
    const candidates = others.map(({ [key]: value }) => value);
    // @ts-ignore - This won't be undefined.
    const baseValue = base[key];
    const value = mostSpecific(baseValue, ...candidates);
    return {
      ...acc,
      [key]: value,
    };
  }, base);
};
