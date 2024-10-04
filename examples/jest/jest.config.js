/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    testEnvironment: "node",
    transform: {
      "^.+.tsx?$": ["ts-jest",{}],
    },
    testSequencer: "@kormanowsky/test-sequencer/jest"
  };