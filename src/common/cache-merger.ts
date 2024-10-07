import glob from 'tiny-glob';

import { TestDurationCache } from './cache';
import { targetProjectPath } from './config';

async function main(argv: string[]): Promise<number> {

    if (argv.length < 3 || argv[0] !== 'merge-cache') {
        console.log('Usage: npx kts merge-cache output_file input_files_glob_1 [input_files_glob_2]...');
        return 1;
    }

    const 
        [outputFilePath, ...inputFilesGlobs] = argv.slice(1),
        cache = new TestDurationCache(outputFilePath);

    for(const inputFilesGlob of inputFilesGlobs) {
        for (const inputFile of await glob(inputFilesGlob, {cwd: targetProjectPath})) {
            const inputCache = new TestDurationCache(inputFile);

            cache.set(inputCache.get());
        }
    }

    return cache.dump() ? 0 : 1;
}


main(process.argv.slice(2))
    .then(process.exit)
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
