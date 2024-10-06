import { cacheFileName, TestDurationCache, TestSharder } from '../common';
import { pwIncludeReporterInArgv, pwOnlyListShardedTests, pwShardConfig } from './config';
import { PlaywrightRunner } from './runner';
import { TestExtractor } from './test-extractor';

const 
    argv = process.argv.slice(2),
    pwRunner = new PlaywrightRunner(argv);

if(argv[0] !== 'test') {
    process.exit(pwRunner.run([PlaywrightRunner.userSuppliedArgs]).exitCode);
} 

const
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
    process.exit(pwRunner.run(
        [PlaywrightRunner.userSuppliedArgs, PlaywrightRunner.reporterArg, ...shardedTestLocations], 
        'inherit'
    ).exitCode);

} else {
    console.info('Note: sharding resulted in no tests being run on this shard. It is expected. Exiting now with code 0');
}
