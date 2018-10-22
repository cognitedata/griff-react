import 'react-select/dist/react-select.css';
import { action } from '@storybook/addon-actions';

const randomData = ({
  timeDomain,
  n = 250,
  singleValue = undefined,
  func = Math.random,
}) => {
  const data = [];
  const dt = (timeDomain[1] - timeDomain[0]) / n;
  for (let i = timeDomain[0]; i <= timeDomain[1]; i += dt) {
    const value = singleValue === undefined ? func(i) : singleValue;
    data.push({
      timestamp: i,
      value,
    });
  }
  return data;
};

export const monoLoader = singleValue => ({
  timeDomain,
  oldSeries,
  reason,
}) => {
  if (reason === 'MOUNTED') {
    return {
      data: randomData({ timeDomain, singleValue }),
    };
  }
  return {
    data: oldSeries.data,
  };
};

export const staticLoader = ({
  id,
  timeDomain,
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
      data: randomData({ func, timeDomain, n, multiplier }),
    };
  }
  // Otherwise, return the existing dataset.
  return {
    ...oldSeries,
  };
};

export const liveLoader = ({ oldSeries, timeDomain: timeDomain, reason }) => {
  // action('LOADER_REQUEST_DATA')(id, reason);
  if (reason === 'MOUNTED') {
    // Create dataset on mount
    return {
      data: randomData({ timeDomain, n: 25 }),
    };
  }
  if (reason === 'INTERVAL') {
    let splicingIndex = 0;
    for (let i = 0; i < oldSeries.data; i += 1) {
      if (oldSeries.data[i] >= timeDomain[0]) {
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

export const customAccessorLoader = ({ timeDomain, oldSeries, reason }) => {
  if (reason === 'MOUNTED') {
    return {
      data: randomData({ timeDomain }).map(d => [d.timestamp, d.value]),
    };
  }
  return {
    data: oldSeries.data,
  };
};
