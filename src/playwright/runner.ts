import { execSync } from 'node:child_process';
import { targetProjectPath } from "../common";
import { pwReporterPath } from './config';

export class PlaywrightRunner {
    constructor() {
        this.originalArgv = process.argv.slice(2);
    }

    run(
        argv: string[], 

        opts: {stdio?: 'pipe'|'ignore'|'inherit'; includeReporter?: boolean} = 
            {stdio: 'pipe', includeReporter: false}
    ): string | null {
        const argString = [
            ...argv, 
            ...this.originalArgv,
            ...(opts.includeReporter ? [`--reporter=${pwReporterPath}`] : [])
        ].join(' ');
        
        const result = execSync(`npx playwright ${argString}`, {cwd: targetProjectPath, stdio: opts.stdio});

        if (opts.stdio === 'pipe') {
            return result.toString();
        }

        return null;
    }

    private originalArgv: string[];
}
