const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

config.resolver.sourceExts.push("sql"); // drizzle schema files

module.exports = withNativeWind(config, { input: "./global.css", inlineRem: 16 });
