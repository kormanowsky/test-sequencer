import path from 'node:path';

export const 
    pwIncludeReporterInArgv = !Boolean(process.env.KTS_PW_NO_REPORTER_IN_ARGV),
    pwOnlyListShardedTests = Boolean(process.env.KTS_PW_ONLY_LIST_SHARDED_TESTS),
    pwReporterPath = path.resolve(__dirname, 'reporter');

export const pwShardConfig = process.env.KTS_PW_SHARD_INDEX != null && process.env.KTS_PW_SHARD_TOTAL != null ? {
    index: parseInt(process.env.KTS_PW_SHARD_INDEX, 10),
    total: parseInt(process.env.KTS_PW_SHARD_TOTAL, 10)
} : {index: 1, total: 1};