import { Reporter, TestCase, TestResult } from "@playwright/test/reporter";

import { cacheFileName, enabled, TestDurationCache } from '../common';

export default class TestReporter implements Reporter {
    constructor() {
        if (!enabled) {
            return;
        }

        this.testRunCache = new Map<[string, string], [number, number]>();
        this.testDurationCache = new TestDurationCache(cacheFileName);
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        if (!enabled) {
            return;
        }

        const 
            testTitle = test.titlePath().join(' '),
            testLocation = `${test.location.file}:${test.location.line}:${test.location.column}`,
            testCacheKey: [string, string] = [testTitle, testLocation];

        if (!this.testRunCache.has(testCacheKey)) {
            this.testRunCache.set(testCacheKey, [result.duration, 1]);
        } else {
            const [storedDuration, storeRetries] = this.testRunCache.get(testCacheKey);

            this.testRunCache.set(testCacheKey, [storedDuration + result.duration, storeRetries + 1]);
        }
    }

    onEnd(): void | Promise<void> {
        if (!enabled) {
            return;
        }

        const preparedCache: Record<string, number> = {};

        for(const [key, value] of this.testRunCache.entries()) {
            const 
                [_, location] = key,
                [duration, retires] = value;

            if (!preparedCache.hasOwnProperty(location)) {
                preparedCache[location] = 0;
            }
            
            preparedCache[location] += duration / retires;
        }

        this.testDurationCache.set(preparedCache, true);
    }

    printsToStdio(): boolean {
        return false;
    }

    private testRunCache: Map<[string, string], [number, number]>;
    private testDurationCache: TestDurationCache;
}
