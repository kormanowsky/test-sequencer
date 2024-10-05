import path from 'node:path';

export const 
    targetProjectPath = path.resolve(__dirname, '..', '..', '..', '..', '..'),
    cacheFileName = process.env.TEST_SEQ_CACHE_FILE ?? 'test-sequencer-cache.json';
