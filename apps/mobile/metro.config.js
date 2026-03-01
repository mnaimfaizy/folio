const { withNxMetro } = require('@nx/expo');
const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const customConfig = {
  cacheVersion: 'mobile',
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'cjs', 'mjs', 'svg'],
  },
};

const config = withNxMetro(mergeConfig(defaultConfig, customConfig), {
  // Change this to true to see debugging info.
  // Useful if you have issues resolving modules
  debug: false,
});

// Preserve Expo defaults so `expo-doctor` doesn't flag our Nx config as incomplete.
config.projectRoot = __dirname;
config.watchFolders = [
  ...new Set([...(defaultConfig.watchFolders ?? []), ...(config.watchFolders ?? [])]),
];
config.resolver = config.resolver ?? {};
config.resolver.nodeModulesPaths = [
  ...new Set([
    ...(defaultConfig.resolver?.nodeModulesPaths ?? []),
    ...(config.resolver.nodeModulesPaths ?? []),
  ]),
];

// Helpful error context when Metro can't resolve a module (e.g. Node built-ins).
if (typeof config.resolver.resolveRequest === 'function') {
  const originalResolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    try {
      // Axios sometimes resolves to its Node build in monorepo setups.
      // Force the browser bundle so Metro doesn't pull in Node core modules (e.g. `crypto`).
      if (moduleName === 'axios') {
        return originalResolveRequest(context, 'axios/dist/browser/axios.cjs', platform);
      }
      return originalResolveRequest(context, moduleName, platform);
    } catch (error) {
      if (moduleName === 'crypto' || moduleName === 'node:crypto') {
         
        console.error(
          '[metro] Failed to resolve',
          moduleName,
          'from',
          context?.originModulePath
        );
      }
      throw error;
    }
  };
}

module.exports = config;
