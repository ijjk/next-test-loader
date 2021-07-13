import { IncrementalCache } from './incremental-cache';
interface CachedRedirectValue {
    kind: 'REDIRECT';
    props: Object;
}
interface CachedPageValue {
    kind: 'PAGE';
    html: string;
    pageData: Object;
}
export declare type ResponseCacheValue = CachedRedirectValue | CachedPageValue;
export declare type ResponseCacheEntry = {
    revalidate?: number | false;
    value: ResponseCacheValue | null;
};
declare type ResponseGenerator = (hasResolved: boolean) => Promise<ResponseCacheEntry>;
export default class ResponseCache {
    incrementalCache: IncrementalCache;
    pendingResponses: Map<string, Promise<ResponseCacheEntry>>;
    constructor(incrementalCache: IncrementalCache);
    get(key: string | null, responseGenerator: ResponseGenerator): Promise<ResponseCacheEntry>;
}
export {};
