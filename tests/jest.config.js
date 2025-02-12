module.exports = {
  testEnvironment: 'node',
  globalSetup: './setup.js',
  globalTeardown: './teardown.js',
  testTimeout: 10000,
  setupFilesAfterEnv: ['./helpers.js'],
};