import path from 'node:path';
import fs from 'node:fs';

import { targetProjectPath } from './config';

export class TestDurationCache {
    constructor(cacheFileName: string) {
        this.cacheFilePath = path.resolve(targetProjectPath, cacheFileName);
        this.cache = null;
    }

    get(): Record<string, number> {
        if (this.cache == null) {
            this.load();
        }

        return this.cache;
    }

    set(cache: Partial<Record<string, number>>, overwrite: boolean = false): boolean {
        if (overwrite) {
            this.cache = cache;    
        } else {
            this.cache = {...this.cache, ...cache};
        }

        return this.dump();
    }

    load(): boolean {
        let canReadCache = false;

        try {
            fs.access(this.cacheFilePath, fs.constants.R_OK, null);
            canReadCache = true;
        } catch (e) {
            console.warn(`Warning: cannot read cache: ${e}`);
        }

        if (canReadCache) {
            this.cache = JSON.parse(fs.readFileSync(this.cacheFilePath, 'utf8'));
        } else {
            this.cache = {};
        }

        return canReadCache;
    }

    dump(): boolean {
        let canWriteCache = false;

        try {
            fs.access(this.cacheFilePath, fs.constants.W_OK, null);
            canWriteCache = true;
        } catch (e) {
            console.warn(`Warning: cannot write cache: ${e}`);
        }

        if (canWriteCache) {
            fs.writeFileSync(this.cacheFilePath, JSON.stringify(this.cache));
        }

        return canWriteCache;
    }

    private cacheFilePath: string;
    private cache: Record<string, number> | null;
}