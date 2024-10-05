import path from 'node:path';

export const 
    targetProjectPath = path.resolve(__dirname, '..', '..', '..', '..', '..'),
    cacheFileName = process.env.KTS_CACHE_FILE ?? 'test-sequencer-cache.json';
