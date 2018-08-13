import React from 'react';

export default React.createContext({
  series: [],
  collections: [],
  baseDomain: [Date.now() - 1000 * 60 * 60 * 24 * 365, 0],
  yAxisWidth: 50,
  contextSeries: [],
});
