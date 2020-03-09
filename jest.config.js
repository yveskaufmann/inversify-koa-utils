const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/node_modules/reflect-metadata/Reflect.js'],
  globals: {
    'ts-jest': {
      tsConfig: path.resolve('./tsconfig.spec.json'),
    },
  },
};
