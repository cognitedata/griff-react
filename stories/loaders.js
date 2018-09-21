import 'react-select/dist/react-select.css';
import { action } from '@storybook/addon-actions';

const randomData = ({
  baseDomain,
  n = 250,
  singleValue = undefined,
  func = Math.random,
}) => {
  const data = [];
  const dt = (baseDomain[1] - baseDomain[0]) / n;
  for (let i = baseDomain[0]; i <= baseDomain[1]; i += dt) {
    const value = singleValue === undefined ? func(i) : singleValue;
    data.push({
      timestamp: i,
      value,
    });
  }
  return data;
};

export const monoLoader = singleValue => ({
  baseDomain,
  oldSeries,
  reason,
}) => {
  if (reason === 'MOUNTED') {
    return {
      data: randomData(baseDomain, 250, singleValue),
    };
  }
  return {
    data: oldSeries.data,
  };
};

export const staticLoader = ({
  id,
  baseDomain,
  n = 250,
  multiplier = 1,
  oldSeries,
  reason,
}) => {
  action('LOADER_REQUEST_DATA')(id, reason);
  if (reason === 'MOUNTED') {
    // Create dataset on mount
    const func = typeof id === 'function' ? id : Math.random;
    return {
      data: randomData({ func, baseDomain, n, multiplier }),
    };
  }
  // Otherwise, return the existing dataset.
  return {
    data: oldSeries.data,
  };
};

export const liveLoader = ({ oldSeries, baseDomain, reason }) => {
  // action('LOADER_REQUEST_DATA')(id, reason);
  if (reason === 'MOUNTED') {
    // Create dataset on mount
    return {
      data: randomData({ baseDomain, n: 25 }),
    };
  }
  if (reason === 'INTERVAL') {
    let splicingIndex = 0;
    for (let i = 0; i < oldSeries.data; i += 1) {
      if (oldSeries.data[i] >= baseDomain[0]) {
        splicingIndex = i - 1;
        break;
      }
    }
    return Math.random() < 0.05
      ? {
          data: [
            ...oldSeries.data.slice(splicingIndex),
            { timestamp: Date.now(), value: Math.random() },
          ],
        }
      : oldSeries;
  }
  // Otherwise, return the existing dataset.
  return {
    data: oldSeries.data,
  };
};

export const customAccessorLoader = ({ baseDomain, oldSeries, reason }) => {
  if (reason === 'MOUNTED') {
    return {
      data: randomData({ baseDomain }).map(d => [d.timestamp, d.value]),
    };
  }
  return {
    data: oldSeries.data,
  };
};
