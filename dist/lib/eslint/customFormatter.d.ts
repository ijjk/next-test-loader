import { ESLint } from 'eslint';
export declare enum MessageSeverity {
    Warning = 1,
    Error = 2
}
export declare function formatResults(baseDir: string, results: ESLint.LintResult[]): string;
