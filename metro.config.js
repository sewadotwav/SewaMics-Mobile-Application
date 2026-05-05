const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Firebase 10+ sometimes uses .cjs files that Metro bundler ignores by default
// This tells Metro to resolve .cjs files correctly, preventing the "component auth has not been registered" crash.
config.resolver.sourceExts.push("cjs");
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
