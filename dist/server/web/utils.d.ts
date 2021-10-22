import type { NodeHeaders } from './types';
export declare function streamToIterator<T>(readable: ReadableStream<T>): AsyncIterableIterator<T>;
export declare function notImplemented(name: string, method: string): any;
export declare function fromNodeHeaders(object: NodeHeaders): {
    [k: string]: string;
};
export declare function toNodeHeaders(headers?: Headers): NodeHeaders;
