import { Header, Redirect, Rewrite } from '../lib/load-custom-routes';
import { ImageConfig } from './image-config';
export declare type DomainLocales = Array<{
    http?: true;
    domain: string;
    locales?: string[];
    defaultLocale: string;
}>;
declare type NoOptionals<T> = {
    [P in keyof T]-?: T[P];
};
export declare type NextConfigComplete = NoOptionals<NextConfig>;
export declare type NextConfig = {
    [key: string]: any;
} & {
    i18n?: {
        locales: string[];
        defaultLocale: string;
        domains?: DomainLocales;
        localeDetection?: false;
    } | null;
    headers?: () => Promise<Header[]>;
    rewrites?: () => Promise<Rewrite[] | {
        beforeFiles: Rewrite[];
        afterFiles: Rewrite[];
        fallback: Rewrite[];
    }>;
    redirects?: () => Promise<Redirect[]>;
    webpack5?: false;
    excludeDefaultMomentLocales?: boolean;
    trailingSlash?: boolean;
    env?: {
        [key: string]: string;
    };
    distDir?: string;
    cleanDistDir?: boolean;
    assetPrefix?: string;
    useFileSystemPublicRoutes?: boolean;
    generateBuildId: () => string | null;
    generateEtags?: boolean;
    pageExtensions?: string[];
    compress?: boolean;
    images?: ImageConfig;
    devIndicators?: {
        buildActivity?: boolean;
    };
    onDemandEntries?: {
        maxInactiveAge?: number;
        pagesBufferLength?: number;
    };
    amp?: {
        canonicalBase?: string;
    };
    basePath?: string;
    sassOptions?: {
        [key: string]: any;
    };
    productionBrowserSourceMaps?: boolean;
    optimizeFonts?: boolean;
    future: {
        /**
         * @deprecated this options was moved to the top level
         */
        webpack5?: false;
        strictPostcssConfiguration?: boolean;
    };
    experimental: {
        cpus?: number;
        plugins?: boolean;
        profiling?: boolean;
        sprFlushToDisk?: boolean;
        reactMode?: 'legacy' | 'concurrent' | 'blocking';
        workerThreads?: boolean;
        pageEnv?: boolean;
        optimizeImages?: boolean;
        optimizeCss?: boolean;
        scrollRestoration?: boolean;
        stats?: boolean;
        externalDir?: boolean;
        conformance?: boolean;
        amp?: {
            optimizer?: any;
            validator?: string;
            skipValidation?: boolean;
        };
        reactRoot?: boolean;
        disableOptimizedLoading?: boolean;
        gzipSize?: boolean;
        craCompat?: boolean;
        esmExternals?: boolean | 'loose';
        staticPageGenerationTimeout?: number;
        pageDataCollectionTimeout?: number;
    };
};
export declare const defaultConfig: NextConfig;
export declare function normalizeConfig(phase: string, config: any): any;
export {};
