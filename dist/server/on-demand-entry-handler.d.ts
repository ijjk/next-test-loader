/// <reference types="webpack-dev-middleware" />
/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import WebpackDevMiddleware from 'next/dist/compiled/webpack-dev-middleware';
import webpack from 'webpack';
export default function onDemandEntryHandler(devMiddleware: WebpackDevMiddleware.WebpackDevMiddleware, multiCompiler: webpack.MultiCompiler, { pagesDir, pageExtensions, maxInactiveAge, pagesBufferLength, }: {
    pagesDir: string;
    pageExtensions: string[];
    maxInactiveAge: number;
    pagesBufferLength: number;
}): {
    ensurePage(page: string): Promise<unknown>;
    middleware(): (req: IncomingMessage, res: ServerResponse, next: Function) => any;
};
