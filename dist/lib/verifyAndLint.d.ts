export declare function verifyAndLint(baseDir: string, pagesDir: string, pagePath: string | null): Promise<{
    results: string;
    hasErrors: boolean;
    hasMessages: boolean;
}>;
