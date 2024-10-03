# Test-sequencer

This package provides test sequencers which shard tests with respect to their estimated run duration. 
Durations are to be collected by the test framework such as `Jest` and to be extracted from the framework's cache. 
When received, tests are distributed into groups by using `distribObjects()` function from `@kormanowsky/distrib` package. The resulting groups are used as groups of tests for each shard. Note: there may be less groups than available shards, so some shards may receive no tests to run. 

## Usage 

1. Install this package by running `npm install -D @kormanowsky/test-sequencer`. 
2. Follow the instructions below depending on which test framework you are using. 

### Jest 

1. Add the following to your `jest.config.js`: 

```js
module.exports = {
    // ...
    testSequencer: "@kormanowsky/test-sequencer/jest"
    // ...
}
```

2. Run `jest` with `--cacheDirectory`: 

```bash
npx jest --cacheDirectory=./jest-cache 
```

3. That's it! Now your tests are run and some cache files, including `perf-cache.json`, are created inside `jest-cache`
directory. Don't forget to add it to your `.gitignore` file, though. 

**Important:** when sharded, tests produce several cache files named `perf-cache.json` maybe inside different run contexts (CI jobs, build machines etc). It is your task to collect and merge them all after all the shards finish and 
all the files are generated. This is similar to how you create one test coverage report for your sharded tests. 
You should make `perf-cache.json` available to all the shards before the next run of the tests. 

**Example:** is provided inside `example` directory. There is also a script `npm run example` which you may run to 
test the example directory. 