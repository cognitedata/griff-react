import React from 'react';

export default React.createContext({
  series: [],
  seriesById: {},
  collections: [],
  updateDomains: () => null,
});
