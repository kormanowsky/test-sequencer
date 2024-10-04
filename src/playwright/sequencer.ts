import {execSync} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { TestSharder } from '../sharder';

interface Test {
    location: string;
    duration?: number;
}

const targetProjectRoot = process.env.TARGET_PROJECT_CWD ?? path.resolve(__filename, '..', '..', '..');

const shardConfig = process.env.SHARD_INDEX != null && process.env.SHARD_TOTAL != null ? {
    index: parseInt(process.env.SHARD_INDEX, 10),
    total: parseInt(process.env.SHARD_TOTAL, 10)
} : {index: 1, total: 1};

const processArgv = process.argv.slice(2);

function parseProcessArgv(processArgv: string[]): {pwArgs: string[]; shardIndex?: number; shardTotal?: number} {
    const argv = [...processArgv];

    let 
        shardConfigArg: string | null = null,
        reporterConfigArg: string | null = null;

    for(let i = 0; i < argv.length; ++i) {
        if (argv[i] === '--shard') {
            if (i + 1 < argv.length) {
                shardConfigArg = argv[i + 1];

                argv.splice(i, 2);
                --i;
            }
        } else if (argv[i].startsWith('--shard=')) {
            shardConfigArg = argv[i].slice('--shard='.length);
            
            argv.splice(i, 1);
            --i;
        } else if (argv[i] === '--reporter') {
            if (i + 1 < argv.length) {
                reporterConfigArg = argv[i + 1];

                argv.splice(i, 2);
                --i;
            }
        } else if (argv[i].startsWith('--reporter=')) {
            reporterConfigArg = argv[i].slice('--reporter='.length);

            argv.slice(i, 1);
            --i;
        }
    }

    const reporterPath = path.resolve(__filename, '..', 'reporter');

    if (reporterConfigArg != null) {
        reporterConfigArg += ',' + reporterPath;
    } else {
        reporterConfigArg = reporterPath;
    }

    argv.push(`--reporter=${reporterConfigArg}`);


    if (shardConfigArg != null) {
        const [strIndex, strTotal] = shardConfigArg.split('/');
    
        return {pwArgs: argv, shardIndex: parseInt(strIndex, 10), shardTotal: parseInt(strTotal, 10)};
    }

    return {pwArgs: argv};
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
    try {
        return JSON.parse(
            fs.readFileSync(
                path.resolve(
                    targetProjectRoot, 'test-results', 'perf-cache.json'
                ), 
                'utf8'
            )
        );

    } catch(e) {
        console.warn(`Error while reading cache file: ${e}`);

        return {};
    }
}

function main(): void {
    const
        {pwArgs, shardIndex, shardTotal} = parseProcessArgv(processArgv),
        tests = extractAllTests(),
        cache = extractCache();

    if (shardIndex != null && shardTotal != null) {
        shardConfig.index = shardIndex;
        shardConfig.total = shardTotal;
    }

    const testObjects: Test[] = [];

    for(const test of tests) {
        testObjects.push({location: test, duration: cache[test]});
    }

    const 
        sharder = new TestSharder<Test>((test) => test.duration ?? 1),
        shardedTests = sharder.shard(testObjects, shardConfig.index, shardConfig.total);

    if (shardedTests.length > 0) {
        runPlaywright([...shardedTests.map(test => test.location), ...pwArgs], 'inherit');
    }
}

main();
