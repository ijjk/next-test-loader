/// <reference types="node" />
/// <reference types="webpack-dev-middleware" />
import { IncomingMessage, ServerResponse } from 'http';
import WebpackDevMiddleware from 'next/dist/compiled/webpack-dev-middleware';
import { UrlObject } from 'url';
import { __ApiPreviewProps } from '../next-server/server/api-utils';
export declare function renderScriptError(res: ServerResponse, error: Error): Promise<void>;
export default class HotReloader {
    private dir;
    private buildId;
    private middlewares;
    private pagesDir;
    private webpackDevMiddleware;
    private webpackHotMiddleware;
    private initialized;
    private config;
    private stats;
    private serverStats;
    private serverPrevDocumentHash;
    private prevChunkNames?;
    private onDemandEntries;
    private previewProps;
    constructor(dir: string, { config, pagesDir, buildId, previewProps, }: {
        config: object;
        pagesDir: string;
        buildId: string;
        previewProps: __ApiPreviewProps;
    });
    run(req: IncomingMessage, res: ServerResponse, parsedUrl: UrlObject): Promise<{
        finished: true | undefined;
    } | undefined>;
    private clean;
    private getWebpackConfig;
    start(): Promise<void>;
    stop(webpackDevMiddleware?: WebpackDevMiddleware.WebpackDevMiddleware): Promise<void>;
    private assignBuildTools;
    private prepareBuildTools;
    private waitUntilValid;
    getCompilationErrors(page: string): Promise<any>;
    private send;
    ensurePage(page: string): Promise<any>;
}
