import 'react-select/dist/react-select.css';
import { action } from '@storybook/addon-actions';

const randomData = ({
  xDomain,
  n = 250,
  singleValue = undefined,
  func = Math.random,
}) => {
  const data = [];
  const dt = (xDomain[1] - xDomain[0]) / n;
  for (let i = xDomain[0]; i <= xDomain[1]; i += dt) {
    const value = singleValue === undefined ? func(i) : singleValue;
    data.push({
      timestamp: i,
      value,
    });
  }
  return data;
};

export const monoLoader = singleValue => ({ xDomain, oldSeries, reason }) => {
  if (reason === 'MOUNTED') {
    return {
      data: randomData({ xDomain, singleValue }),
    };
  }
  return {
    data: oldSeries.data,
  };
};

export const staticLoader = ({
  id,
  timeDomain: xDomain,
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
      data: randomData({ func, xDomain, n, multiplier }),
    };
  }
  // Otherwise, return the existing dataset.
  return {
    ...oldSeries,
  };
};

export const liveLoader = ({ oldSeries, timeDomain: xDomain, reason }) => {
  // action('LOADER_REQUEST_DATA')(id, reason);
  if (reason === 'MOUNTED') {
    // Create dataset on mount
    return {
      data: randomData({ xDomain, n: 25 }),
    };
  }
  if (reason === 'INTERVAL') {
    let splicingIndex = 0;
    for (let i = 0; i < oldSeries.data; i += 1) {
      if (oldSeries.data[i] >= xDomain[0]) {
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

export const customAccessorLoader = ({ xDomain, oldSeries, reason }) => {
  if (reason === 'MOUNTED') {
    return {
      data: randomData({ xDomain }).map(d => [d.timestamp, d.value]),
    };
  }
  return {
    data: oldSeries.data,
  };
};
