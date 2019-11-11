import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import typescriptPkg from 'typescript';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript({
      typescript: typescriptPkg,
      include: ['*.js', '**/*.js', '*.ts', '**/*.ts', '*.tsx', '**/*.tsx'],
      exclude: ['*.stories.*', '*.spec.*'],
    }),
    json(),
  ],
};
