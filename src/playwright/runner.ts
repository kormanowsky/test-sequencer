import { execSync } from 'node:child_process';
import { targetProjectPath } from "../common";
import { pwIncludeReporterInArgv, pwReporterPath } from './config';

export class PlaywrightRunner {
    static readonly userSuppliedArgs: string = '--user-supplied-args--';
    static readonly reporterArg: string = '--reporter-arg--';

    constructor(userSuppliedArgv: string[]) {
        this.userSuppliedArgv = userSuppliedArgv;
    }

    run(argv: string[], stdio: 'pipe'|'ignore'|'inherit' = 'pipe'): {output: string; exitCode: number} {
        const allArgs = [].concat(
            ...argv.map<string | string[]>((arg: string) => {
                if (arg === PlaywrightRunner.userSuppliedArgs) {
                    return this.userSuppliedArgv;

                } else if (arg === PlaywrightRunner.reporterArg) {
                    if (pwIncludeReporterInArgv){
                        return `--reporter=${pwReporterPath}`;
                    }

                    return [];
                }

                return arg;
            })
        );

        const 
            argString = allArgs.join(' '),
            result = {output: '', exitCode: -1};

        try {
            const runResult = execSync(`npx playwright ${argString}`, {cwd: targetProjectPath, stdio});

            if (stdio === 'pipe') {
                result.output = runResult.toString();
            }

            result.exitCode = 0;

        } catch (err) {
            result.exitCode = err.status ?? -1;
            result.output = (err.stdout ?? '').toString();
        }

        return result;
    }

    private userSuppliedArgv: string[];
}
