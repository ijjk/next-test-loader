import { FetchEvent } from '../spec-compliant/fetch-event';
import { NextRequest } from './request';
export declare class NextFetchEvent extends FetchEvent {
    readonly request: NextRequest;
    constructor(request: NextRequest);
}
