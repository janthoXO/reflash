const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Watch the shared package
config.watchFolders = [path.resolve(__dirname, '../shared')];

// Resolve @reflash/shared to the source files
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '..'),
];

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
