import path from 'node:path';
import { targetProjectPath } from "../common";
import { PlaywrightRunner } from "./runner";

export class TestExtractor {
    constructor(pwRunner: PlaywrightRunner) {
        this.pwRunner = pwRunner;
    }

    extractAllTests(): string[] {
        const 
            rawOutput = this.pwRunner.run(['test', '--list']).output,
            tests = new Set<string>();

        for(const line of rawOutput.split('\n')) {
            const testLocationMatch = this.pwTestLocationRegex.exec(line);
           
            if (testLocationMatch != null) {
                tests.add(path.resolve(targetProjectPath, testLocationMatch[1]));
            }
        }

        return [...tests];
    }

    private pwTestLocationRegex = /›?\s*([^›]+\.[t|j]sx?:\d+:\d+)\s*›/;
    private pwRunner: PlaywrightRunner;
}