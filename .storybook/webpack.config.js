const path = require('path');

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: {
          presets: [
            [
              'react-app',
              {
                flow: false,
                typescript: true,
              },
            ],
          ],
        },
      },
    ],
  });

  config.resolve.extensions.push('.ts', '.tsx');

  // Required for absolute imports in Storybook
  const resolvedModules = config.resolve.modules || [];
  config.resolve.modules = [...resolvedModules, path.resolve(process.cwd(), 'src')];


  return config;
};
