import Super, { ShardOptions } from "@jest/test-sequencer";
import { Test } from "@jest/test-result";

import { TestSharder } from "./sharder";

export default class TestSequencer extends Super {
    constructor() {
        super();

        this.sharder = new TestSharder<Test>((test) => test.duration);
    }

    override shard(tests: Array<Test>, options: ShardOptions): Array<Test> | Promise<Array<Test>> {
        return this.sharder.shard(tests, options.shardIndex, options.shardCount);
    }

    private sharder: TestSharder<Test>;
}
