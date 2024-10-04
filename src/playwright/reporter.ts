import fs from 'node:fs';
import { FullResult, Reporter, TestCase, TestResult } from "@playwright/test/reporter";

export default class TestReporter implements Reporter {
    onTestEnd(test: TestCase, result: TestResult): void {
        const 
            testTitle = test.titlePath().join(' '),
            testLocation = `${test.location.file}:${test.location.line}:${test.location.column}`,
            testCacheKey: [string, string] = [testTitle, testLocation];

        if (!this.cache.has(testCacheKey)) {
            this.cache.set(testCacheKey, [result.duration, 1]);
        } else {
            const [storedDuration, storeRetries] = this.cache.get(testCacheKey);

            this.cache.set(testCacheKey, [storedDuration + result.duration, storeRetries + 1]);
        }
    }

    onEnd(result: FullResult): void | Promise<void> {
        const preparedCache: Record<string, number> = {};

        for(const [key, value] of this.cache.entries()) {
            const 
                [_, location] = key,
                [duration, retires] = value;

            if (!preparedCache.hasOwnProperty(location)) {
                preparedCache[location] = 0;
            }
            
            preparedCache[location] += duration / retires;
        }

        fs.writeFileSync('test-results/perf-cache.json', JSON.stringify(preparedCache));
    }

    printsToStdio(): boolean {
        return false;
    }

    private cache: Map<[string, string], [number, number]> = new Map<[string, string], [number, number]>();
}