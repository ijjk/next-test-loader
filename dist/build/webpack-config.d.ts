import webpack from 'webpack';
import { WebpackEntrypoints } from './entries';
import { Rewrite } from '../lib/load-custom-routes';
export declare function attachReactRefresh(webpackConfig: webpack.Configuration, targetLoader: webpack.RuleSetUseItem): void;
export default function getBaseWebpackConfig(dir: string, { buildId, config, dev, isServer, pagesDir, tracer, target, reactProductionProfiling, entrypoints, rewrites, }: {
    buildId: string;
    config: any;
    dev?: boolean;
    isServer?: boolean;
    pagesDir: string;
    target?: string;
    tracer?: any;
    reactProductionProfiling?: boolean;
    entrypoints: WebpackEntrypoints;
    rewrites: Rewrite[];
}): Promise<webpack.Configuration>;
