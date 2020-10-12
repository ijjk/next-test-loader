/// <reference types="node" />
import { IncomingMessage } from 'http';
export declare function detectDomainLocales(req: IncomingMessage, domainItems: Array<{
    domain: string;
    locales: string[];
    defaultLocale: string;
}> | undefined, locales: string[], defaultLocale: string): {
    defaultLocale: string;
    locales: string[];
};
