export declare function detectDomainLocale(domainItems: Array<{
    http?: boolean;
    domain: string;
    defaultLocale: string;
}> | undefined, hostname?: string, detectedLocale?: string): {
    http?: boolean | undefined;
    domain: string;
    defaultLocale: string;
} | undefined;
