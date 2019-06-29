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
      y: value,
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
      data: randomData({ timeDomain, singleValue, n: 1 }),
    };
  }
  return {
    data: oldSeries.data,
  };
};

export const staticLoader = ({
  id,
  timeDomain,
  pointsPerSeries: n = 250,
  multiplier = 1,
  oldSeries,
  reason,
}) => {
  action('LOADER_REQUEST_DATA')(id, reason);
  let out = { ...oldSeries };
  if (reason === 'MOUNTED') {
    // Create dataset on mount
    const func = typeof id === 'function' ? id : Math.random;
    const data = randomData({ func, timeDomain, n, multiplier });
    out = { data };
  }
  // Otherwise, return the existing dataset.
  return out;
};

export const liveLoader = ({ oldSeries, timeDomain, reason }) => {
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
      data: randomData({ timeDomain }).map(d => [d.timestamp, d.y]),
    };
  }
  return {
    data: oldSeries.data,
  };
};

export const functionLoader = func => ({ timeSubDomain, pointsPerSeries }) => {
  const data = [];
  const dt = (timeSubDomain[1] - timeSubDomain[0]) / pointsPerSeries;
  for (
    let timestamp = timeSubDomain[0];
    timestamp <= timeSubDomain[1];
    timestamp += dt
  ) {
    data.push({
      timestamp,
      value: func(timestamp),
    });
  }
  return { data };
};
