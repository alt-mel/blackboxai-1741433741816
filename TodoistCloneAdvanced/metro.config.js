const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add any custom Metro configuration here
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'mjs',
  'cjs',
];

// Support for SVG files if needed
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

module.exports = config;
