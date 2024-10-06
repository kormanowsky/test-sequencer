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
        try {
            this.cache = JSON.parse(fs.readFileSync(this.cacheFilePath, 'utf8'));
            return true;
        } catch (e) {
            this.cache = {};
            console.warn(`Warning: cannot read cache: ${e}`);
            return false;
        }
    }

    dump(): boolean {
        try {
            fs.writeFileSync(this.cacheFilePath, JSON.stringify(this.cache));
            return true;
        } catch (e) {
            console.warn(`Warning: cannot write cache: ${e}`);
            return false;
        }
    }

    private cacheFilePath: string;
    private cache: Record<string, number> | null;
}