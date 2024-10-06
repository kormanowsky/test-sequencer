import Super, { ShardOptions } from "@jest/test-sequencer";
import { AggregatedResult, Test } from "@jest/test-result";

import { TestSharder, TestDurationCache, cacheFileName, enabled } from "../common";

export class JestTestSequencer extends Super {
    constructor() {
        super();

        if (!enabled) {
            return;
        }

        this.sharder = new TestSharder<Test>((test) => test.duration ?? 1);
        this.cache = new TestDurationCache(cacheFileName);
    }

    override shard(tests: Array<Test>, options: ShardOptions): Array<Test> | Promise<Array<Test>> {
        if (!enabled) {
            return super.shard(tests, options);
        }

        const 
            cache = this.cache.get(),
            testsWithDurations = tests.map((test) => ({...test, duration: cache[test.path]}));

        return this.sharder.shard(testsWithDurations, options.shardIndex, options.shardCount);
    }

    cacheResults(tests: Array<Test>, results: AggregatedResult): void {
        super.cacheResults(tests, results);

        if (!enabled) {
            return;
        }

        const 
            preparedCache: Record<string, number> = {},
            map: Record<string, Test> = {};

        for (const test of tests) {
            map[test.path] = test;
        }

        for (const testResult of results.testResults) {
            const test = map[testResult.testFilePath];
            if (test != null && !testResult.skipped) {
                const 
                    perf = testResult.perfStats,
                    testRuntime = perf.runtime ?? test.duration ?? perf.end - perf.start;

                preparedCache[testResult.testFilePath] = testRuntime ?? 0;
            }
        }   

        this.cache.set(preparedCache);
    }

    private sharder: TestSharder<Test>;
    private cache: TestDurationCache;
}
