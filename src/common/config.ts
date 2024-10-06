import path from 'node:path';

export const 
    targetProjectPath = process.env.KTS_TARGET_PROJECT_PATH ?? path.resolve(__dirname, '..', '..', '..', '..', '..'),
    cacheFileName = process.env.KTS_CACHE_FILE ?? 'kts-cache.json';
