module.exports = {
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  transform: {
    '^.+\\.(ts|js)x?$': 'ts-jest',
  },
  testRegex: '(/.*(\\.|/)(test|spec))\\.(tsx|ts|js)?$',
  moduleFileExtensions: ['ts', 'js', 'tsx', 'json', 'node'],
  coverageDirectory: './coverage/',
  collectCoverage: true,
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss)$':
      '<rootDir>/node_modules/jest-css-modules-transform',
  },
};
