const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Watch the shared package
config.watchFolders = [path.resolve(workspaceRoot, "shared")];

// Resolve @reflash/shared to the source files
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.sourceExts.push("sql"); // drizzle schema files

module.exports = withNativeWind(config, { input: "./global.css", inlineRem: 16 });
