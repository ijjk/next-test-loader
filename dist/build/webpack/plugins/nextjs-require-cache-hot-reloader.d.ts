import type { Compiler, WebpackPluginInstance } from 'webpack5';
export declare class NextJsRequireCacheHotReloader implements WebpackPluginInstance {
    prevAssets: any;
    previousOutputPathsWebpack5: Set<string>;
    currentOutputPathsWebpack5: Set<string>;
    apply(compiler: Compiler): void;
}
