// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  verbose: true,
  testTimeout: 10000,
  rootDir: 'e2e',
  // coverage: true,
};

module.exports = config;
module.exports = {
  setupFiles: ["<rootDir>/.jest/setEnvVars.js"]
}