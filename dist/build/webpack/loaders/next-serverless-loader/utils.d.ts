/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import { UrlWithParsedQuery } from 'url';
import { ParsedUrlQuery } from 'querystring';
import { Rewrite } from '../../../../lib/load-custom-routes';
import { __ApiPreviewProps } from '../../../../next-server/server/api-utils';
import { BuildManifest } from '../../../../next-server/server/get-page-files';
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from '../../../../types';
export declare const vercelHeader = "x-vercel-id";
export declare type ServerlessHandlerCtx = {
    page: string;
    pageModule: any;
    pageComponent?: any;
    pageConfig?: any;
    pageGetStaticProps?: GetStaticProps;
    pageGetStaticPaths?: GetStaticPaths;
    pageGetServerSideProps?: GetServerSideProps;
    appModule?: any;
    errorModule?: any;
    documentModule?: any;
    notFoundModule?: any;
    runtimeConfig: any;
    buildManifest?: BuildManifest;
    reactLoadableManifest?: any;
    basePath: string;
    rewrites: Rewrite[];
    pageIsDynamic: boolean;
    generateEtags: boolean;
    distDir: string;
    buildId: string;
    escapedBuildId: string;
    assetPrefix: string;
    poweredByHeader: boolean;
    canonicalBase: string;
    encodedPreviewProps: __ApiPreviewProps;
    i18n?: {
        localeDetection?: false;
        locales: string[];
        defaultLocale: string;
        domains: Array<{
            domain: string;
            locales: string[];
            defaultLocale: string;
        }>;
    };
    experimental: {
        initServer: () => Promise<any>;
        onError: ({ err }: {
            err: Error;
        }) => Promise<any>;
    };
};
export declare function getUtils({ page, i18n, basePath, rewrites, pageIsDynamic, }: ServerlessHandlerCtx): {
    handleLocale: (req: IncomingMessage, res: ServerResponse, parsedUrl: UrlWithParsedQuery, routeNoAssetPath: string, shouldNotRedirect: boolean) => {
        defaultLocale: string;
        detectedLocale: string;
        routeNoAssetPath: string;
    } | undefined;
    handleRewrites: (parsedUrl: UrlWithParsedQuery) => UrlWithParsedQuery;
    handleBasePath: (req: IncomingMessage, parsedUrl: UrlWithParsedQuery) => void;
    defaultRouteRegex: {
        re: RegExp;
        namedRegex?: string | undefined;
        routeKeys?: {
            [named: string]: string;
        } | undefined;
        groups: {
            [groupName: string]: import("../../../../next-server/lib/router/utils/route-regex").Group;
        };
    } | undefined;
    dynamicRouteMatcher: ((pathname: string | null | undefined) => false | {
        [paramName: string]: string | string[];
    }) | undefined;
    defaultRouteMatches: ParsedUrlQuery | undefined;
    normalizeDynamicRouteParams: (params: ParsedUrlQuery) => {
        params: ParsedUrlQuery;
        hasValidParams: boolean;
    };
};
