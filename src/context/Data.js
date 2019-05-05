import React from 'react';

export default React.createContext({
  series: [],
  collections: [],
  xDomain: [Date.now() - 1000 * 60 * 60 * 24 * 365, 0],
  // eslint-disable-next-line no-console
  registerSeries: (...args) => console.log('Fake-registering series:', ...args),
});
