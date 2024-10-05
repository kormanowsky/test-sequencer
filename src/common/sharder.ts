import { distribObjects } from "@kormanowsky/distrib";

export class TestSharder<T> {
    constructor(getTestEstimatedTime: (test: T) => number) {
        this.getTestEstimatedTime = getTestEstimatedTime;
    }

    shard(
        tests: T[],
        shardIndex: number,
        shardsTotal: number
    ): T[] {
        const distributedTests = this.distribute(tests, shardsTotal);

        if (distributedTests.length < shardIndex) {
            return [];
        }

        return distributedTests[shardIndex - 1];
    }

    protected distribute(tests: T[], shards: number): T[][] {
        return distribObjects(tests, this.getTestEstimatedTime, shards);
    }

    private getTestEstimatedTime: (this: void, test: T) => number;
}
