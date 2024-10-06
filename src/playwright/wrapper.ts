import { cacheFileName, TestDurationCache, TestSharder } from '../common';
import { pwIncludeReporterInArgv, pwOnlyListShardedTests, pwShardConfig } from './config';
import { PlaywrightRunner } from './runner';
import { TestExtractor } from './test-extractor';

const
    pwRunner = new PlaywrightRunner(),
    testExtractor = new TestExtractor(pwRunner),
    testDurationCache = new TestDurationCache(cacheFileName),
    sharder = new TestSharder<{location: string; duration?: number}>((test) => test.duration ?? 1),
    cache = testDurationCache.get(),
    tests = testExtractor.extractAllTests().map(location => ({location, duration: cache[location]})),
    shardedTests = sharder.shard(tests, pwShardConfig.index, pwShardConfig.total),
    shardedTestLocations = shardedTests.map(test => test.location);

if (pwOnlyListShardedTests) {
    shardedTestLocations.forEach(location => console.log(location));
} else if (shardedTests.length > 0) {
    pwRunner.run(['test', ...shardedTestLocations], {stdio: 'inherit', includeReporter: pwIncludeReporterInArgv});
}