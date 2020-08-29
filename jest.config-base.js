module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 60 * 1000,
  // Target only *.tsx?
  testMatch: [ "**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)" ]
};
