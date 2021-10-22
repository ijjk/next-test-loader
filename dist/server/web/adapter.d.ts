import type { RequestData, FetchEventResult } from './types';
import { NextFetchEvent } from './spec-extension/fetch-event';
export declare function adapter(params: {
    handler: (event: NextFetchEvent) => void | Promise<void>;
    request: RequestData;
}): Promise<FetchEventResult>;
