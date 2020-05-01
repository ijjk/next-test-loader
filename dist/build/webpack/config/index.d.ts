import webpack from 'webpack';
export declare function build(config: webpack.Configuration, { rootDirectory, customAppFile, isDevelopment, isServer, hasReactRefresh, assetPrefix, sassOptions, }: {
    rootDirectory: string;
    customAppFile: string | null;
    isDevelopment: boolean;
    isServer: boolean;
    hasReactRefresh: boolean;
    assetPrefix: string;
    sassOptions: any;
}): Promise<webpack.Configuration>;
