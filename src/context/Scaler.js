import React from 'react';

export default React.createContext({
  xSubDomain: [0, 0],
  xDomain: [0, 0],
  yDomains: {},
  series: [],
  collections: [],
  domainsByItemId: {},
  subDomainsByItemId: {},
});
