import Super, { ShardOptions } from "@jest/test-sequencer";
import { AggregatedResult, Test } from "@jest/test-result";

import { TestSharder, TestDurationCache, cacheFileName } from "../common";

export class JestTestSequencer extends Super {
    constructor() {
        super();

        this.sharder = new TestSharder<Test>((test) => test.duration ?? 1);
        this.cache = new TestDurationCache(cacheFileName);
    }

    override shard(tests: Array<Test>, options: ShardOptions): Array<Test> | Promise<Array<Test>> {
        const 
            cache = this.cache.get(),
            testsWithDurations = tests.map((test) => ({...test, duration: cache[test.path]}));

        return this.sharder.shard(testsWithDurations, options.shardIndex, options.shardCount);
    }

    cacheResults(tests: Array<Test>, results: AggregatedResult): void {
        super.cacheResults(tests, results);

        this.cache.dump();
    }

    private sharder: TestSharder<Test>;
    private cache: TestDurationCache;
}
