import {execSync} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { TestSharder } from '../sharder';

const targetProjectRoot = process.env.TARGET_PROJECT_CWD ?? 
    path.resolve(__filename, '..', '..', '..');

const shardConfigArg = /--shard[ =](\d+)\/(\d+)/.exec(process.argv.join(' '));

const shardConfig = {index: 1, total: 1};

if (shardConfigArg != null) {
    shardConfig.index = parseInt(shardConfigArg[1], 10);
    shardConfig.total = parseInt(shardConfigArg[2], 10);
} else if (process.env.SHARD_INDEX != null && process.env.SHARD_TOTAL != null) {
    shardConfig.index = parseInt(process.env.SHARD_INDEX, 10);
    shardConfig.total = parseInt(process.env.SHARD_TOTAL, 10);
}

function runPlaywright(args: string[], stdio: 'pipe'|'ignore'|'inherit' = 'pipe'): string | null {
    const result = execSync(`npx playwright test ${args.join(' ')}`, {cwd: targetProjectRoot, stdio});

    if (stdio === 'pipe') {
        return result.toString();
    }

    return null;
}

function extractAllTests(): Set<string> {
    const 
        rawAllTests = runPlaywright(['--list']),
        lines = rawAllTests!.split('\n'),
        allTests: Set<string> = new Set<string>();
    
    let i = 1;

    while (!lines[i].startsWith('Total:')) {
        const 
            line = lines[i],
            location = line.trimStart().split(' ')[0].trim();
        
        allTests.add(path.resolve(targetProjectRoot, location));

        i++;
    }

    return allTests;
}

function extractCache(): Record<string, number> {
    return JSON.parse(
        fs.readFileSync(
            path.resolve(
                targetProjectRoot, 'playwright-cache', 'perf-cache.json'
            ), 
            'utf8'
        )
    );
}

interface Test {
    location: string;
    duration?: number;
}

const 
    tests = extractAllTests(),
    cache = extractCache();

const testObjects: Test[] = [];

for(const test of tests) {
    testObjects.push({location: test, duration: cache[test]});
}

const 
    sharder = new TestSharder<Test>((test) => test.duration ?? 1),
    shardedTests = sharder.shard(testObjects, shardConfig.index, shardConfig.total);


if (shardedTests.length > 0) {
   runPlaywright(shardedTests.map(test => test.location), 'inherit');
}
