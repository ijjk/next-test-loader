/// <reference types="node" />
import { IncomingMessage } from 'http';
export declare function detectDomainLocale(domainItems: Array<{
    http?: boolean;
    domain: string;
    defaultLocale: string;
}> | undefined, req?: IncomingMessage, detectedLocale?: string): {
    http?: boolean | undefined;
    domain: string;
    defaultLocale: string;
} | undefined;
