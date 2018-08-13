import React from 'react';

export default React.createContext({
  subDomain: [0, 0],
  baseDomain: [0, 0],
  yDomains: {},
  yTransformations: {},
  series: [],
  collections: [],
});
