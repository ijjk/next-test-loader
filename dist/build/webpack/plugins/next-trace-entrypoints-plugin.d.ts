import { Span } from '../../../trace';
import { webpack } from 'next/dist/compiled/webpack/webpack';
import { NextConfigComplete } from '../../../server/config-shared';
export declare class TraceEntryPointsPlugin implements webpack.Plugin {
    private appDir;
    private entryTraces;
    private excludeFiles;
    private esmExternals?;
    private staticImageImports?;
    constructor({ appDir, excludeFiles, esmExternals, staticImageImports, }: {
        appDir: string;
        excludeFiles?: string[];
        staticImageImports: boolean;
        esmExternals?: NextConfigComplete['experimental']['esmExternals'];
    });
    createTraceAssets(compilation: any, assets: any, span: Span): void;
    tapfinishModules(compilation: webpack.compilation.Compilation, traceEntrypointsPluginSpan: Span, doResolve?: (request: string, parent: string, job: import('@vercel/nft/out/node-file-trace').Job, isEsmRequested: boolean) => Promise<string>): void;
    apply(compiler: webpack.Compiler): void;
}
