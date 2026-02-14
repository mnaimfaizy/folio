import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';
import reactNative from 'eslint-plugin-react-native';

export default [
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      'react-native': reactNative,
    },
    // Override or add rules here
    rules: {},
  },
  {
    ignores: ['.expo', 'web-build', 'cache', 'dist'],
  },
];
