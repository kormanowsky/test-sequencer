import fs from 'node:fs';
import path from 'node:path';

import Super, { ShardOptions } from "@jest/test-sequencer";
import { AggregatedResult, Test, TestContext } from "@jest/test-result";

import { TestSharder } from "./sharder";

export default class TestSequencer extends Super {
    constructor() {
        super();

        this.sharder = new TestSharder<Test>((test) => test.duration ?? 1);
    }

    _getCachePath(testContext: TestContext): string {
        const {config} = testContext;

        return path.join(config.cacheDirectory, 'perf-cache.json');
    }

    override shard(tests: Array<Test>, options: ShardOptions): Array<Test> | Promise<Array<Test>> {
        const testsWithDurations = tests.map((test) => {
            const cache = this._getCache(test);

            test.duration = cache[test.path]?.[1];

            return test;
        });

        return this.sharder.shard(testsWithDurations, options.shardIndex, options.shardCount);
    }

    cacheResults(tests: Array<Test>, results: AggregatedResult): void {
        super.cacheResults(tests, results);
    }

    private sharder: TestSharder<Test>;
}
