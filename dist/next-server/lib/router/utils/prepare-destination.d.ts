/// <reference types="node" />
import { ParsedUrlQuery } from 'querystring';
declare type Params = {
    [param: string]: any;
};
export default function prepareDestination(destination: string, params: Params, query: ParsedUrlQuery, appendParamsToQuery: boolean, basePath: string): {
    newUrl: string;
    parsedDestination: {
        query?: ParsedUrlQuery | undefined;
        protocol?: string | undefined;
        hostname?: string | undefined;
        port?: string | undefined;
    } & {
        pathname: string;
        searchParams: URLSearchParams;
        search: string;
        hash: string;
        href: string;
    };
};
export {};
