const path = require('path');

module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: false,
  },
  webpack: {
    extra: {
      entry: path.resolve('./build/src'),
    },
  },
};
