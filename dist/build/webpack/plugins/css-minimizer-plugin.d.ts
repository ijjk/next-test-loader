import webpack from 'webpack';
import { RawSource, SourceMapSource } from 'webpack-sources';
declare type CssMinimizerPluginOptions = {
    postcssOptions: {
        map: false | {
            prev?: string | false;
            inline: boolean;
            annotation: boolean;
        };
    };
};
export declare class CssMinimizerPlugin {
    __next_css_remove: boolean;
    private options;
    constructor(options: CssMinimizerPluginOptions);
    optimizeAsset(file: string, asset: any): Promise<RawSource | SourceMapSource>;
    apply(compiler: webpack.Compiler): void;
}
export {};
