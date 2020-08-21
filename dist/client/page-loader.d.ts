import { ComponentType } from 'react';
export declare function createLink(href: string, rel: string, as?: string, link?: HTMLLinkElement): [HTMLLinkElement, Promise<any>];
export declare type GoodPageCache = {
    page: ComponentType;
    mod: any;
    styleSheets: string[];
};
export declare type PageCacheEntry = {
    error: any;
} | GoodPageCache;
export default class PageLoader {
    private initialPage;
    private initialStyleSheets;
    private buildId;
    private assetPrefix;
    private pageCache;
    private pageRegisterEvents;
    private loadingRoutes;
    private promisedBuildManifest?;
    private promisedSsgManifest?;
    private promisedDevPagesManifest?;
    constructor(buildId: string, assetPrefix: string, initialPage: string, initialStyleSheets: string[]);
    getPageList(): any;
    private getDependencies;
    /**
     * @param {string} href the route href (file-system path)
     * @param {string} asPath the URL as shown in browser (virtual path); used for dynamic routes
     */
    getDataHref(href: string, asPath: string, ssg: boolean): string | undefined;
    /**
     * @param {string} href the route href (file-system path)
     * @param {string} asPath the URL as shown in browser (virtual path); used for dynamic routes
     */
    prefetchData(href: string, asPath: string): Promise<void>;
    loadPage(route: string): Promise<GoodPageCache>;
    registerPage(route: string, regFn: () => any): void;
    /**
     * @param {string} route
     * @param {boolean} [isDependency]
     */
    prefetch(route: string, isDependency?: boolean): Promise<void>;
}
