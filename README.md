# Test-sequencer

This package provides test sequencers which shard tests with respect to their estimated run duration. 
Durations are to be collected by the test framework such as `Jest` and to be extracted from the framework's cache. 
When received, tests are distributed into groups by using `distribObjects()` function from `@kormanowsky/distrib` package. The resulting groups are used as groups of tests for each shard. Note: there may be less groups than available shards, so some shards may receive no tests to run. 

## Usage 

1. Install this package by running `npm install -D @kormanowsky/test-sequencer`. 
2. Follow the instructions below depending on which test framework you are using. 

### Common notes 

When you run the tests, a file named `kts-cache.json` is created in your project's root directory. 
Don't forget to cache it on CI and add it to your `.gitignore` file. 

**Important:** when sharded, tests produce several cache files named `kts-cache.json` maybe inside different run contexts (CI jobs, build machines etc). It is your task to collect and merge them all after all the shards finish and 
all the files are generated. You may use `npx kts merge-cache kts-cache.json kts-cache*.json` to fulfil this task. 
This is similar to how you create one test coverage report for your sharded tests. 
You should make `kts-cache.json` available to all the shards before the next run of the tests.

### Jest 

Add the following to your `jest.config.js`: 

```js
module.exports = {
    // ...
    testSequencer: "@kormanowsky/test-sequencer/jest"
    // ...
}
```

**Example:** is provided inside `examples/jest` directory.

### Playwright 

Use `npx kts-pw` instead of `npx playwright`. 
This file will shard tests and run `npx playwright test`, passing all arguments to Playwright. 
Shard index and total shards count must be set as `KTS_PW_SHARD_INDEX` and `KTS_PW_SHARD_TOTAL`, respectively. 
Do not use `--shard=...` for this purpose. 

**Example:** is provided inside `examples/playwright` directory.
