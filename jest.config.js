module.exports = {
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx|ts|js)?$',
  moduleFileExtensions: ['ts', 'js', 'tsx', 'json', 'node'],
  coverageDirectory: './coverage/',
  collectCoverage: true,
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss)$':
      '<rootDir>/node_modules/jest-css-modules-transform',
  },
};
