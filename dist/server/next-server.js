"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = void 0;
var _compression = _interopRequireDefault(require("next/dist/compiled/compression"));
var _fs = _interopRequireDefault(require("fs"));
var _chalk = _interopRequireDefault(require("chalk"));
var _httpProxy = _interopRequireDefault(require("next/dist/compiled/http-proxy"));
var _path = require("path");
var _querystring = require("querystring");
var _url = require("url");
var _loadCustomRoutes = require("../lib/load-custom-routes");
var _constants = require("../shared/lib/constants");
var _utils = require("../shared/lib/router/utils");
var envConfig = _interopRequireWildcard(require("../shared/lib/runtime-config"));
var _utils1 = require("../shared/lib/utils");
var _apiUtils = require("./api-utils");
var _config = require("./config");
var _pathMatch = _interopRequireDefault(require("../shared/lib/router/utils/path-match"));
var _recursiveReaddirSync = require("./lib/recursive-readdir-sync");
var _loadComponents = require("./load-components");
var _normalizePagePath = require("./normalize-page-path");
var _render = require("./render");
var _require = require("./require");
var _router = _interopRequireWildcard(require("./router"));
var _prepareDestination = _interopRequireWildcard(require("../shared/lib/router/utils/prepare-destination"));
var _sendPayload = require("./send-payload");
var _serveStatic = require("./serve-static");
var _incrementalCache = require("./incremental-cache");
var _utils2 = require("./utils");
var _env = require("@next/env");
require("./node-polyfill-fetch");
var _normalizeTrailingSlash = require("../client/normalize-trailing-slash");
var _getRouteFromAssetPath = _interopRequireDefault(require("../shared/lib/router/utils/get-route-from-asset-path"));
var _denormalizePagePath = require("./denormalize-page-path");
var _accept = _interopRequireDefault(require("@hapi/accept"));
var _normalizeLocalePath = require("../shared/lib/i18n/normalize-locale-path");
var _detectLocaleCookie = require("../shared/lib/i18n/detect-locale-cookie");
var Log = _interopRequireWildcard(require("../build/output/log"));
var _imageOptimizer = require("./image-optimizer");
var _detectDomainLocale = require("../shared/lib/i18n/detect-domain-locale");
var _cookie = _interopRequireDefault(require("next/dist/compiled/cookie"));
var _escapePathDelimiters = _interopRequireDefault(require("../shared/lib/router/utils/escape-path-delimiters"));
var _utils3 = require("../build/webpack/loaders/next-serverless-loader/utils");
var _responseCache = _interopRequireDefault(require("./response-cache"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
        return obj;
    } else {
        var newObj = {
        };
        if (obj != null) {
            for(var key in obj){
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {
                    };
                    if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                    } else {
                        newObj[key] = obj[key];
                    }
                }
            }
        }
        newObj.default = obj;
        return newObj;
    }
}
const getCustomRouteMatcher = (0, _pathMatch).default(true);
class Server {
    constructor({ dir ='.' , quiet =false , conf , dev =false , minimalMode =false , customServer =true  }){
        var ref, ref1, ref2;
        this.customErrorNo404Warn = (0, _utils1).execOnce(()=>{
            console.warn(_chalk.default.bold.yellow(`Warning: `) + _chalk.default.yellow(`You have added a custom /_error page without a custom /404 page. This prevents the 404 page from being auto statically optimized.\nSee here for info: https://nextjs.org/docs/messages/custom-error-no-custom-404`));
        });
        this._validFilesystemPathSet = null;
        this.dir = (0, _path).resolve(dir);
        this.quiet = quiet;
        (0, _env).loadEnvConfig(this.dir, dev, Log);
        this.nextConfig = conf;
        this.distDir = (0, _path).join(this.dir, this.nextConfig.distDir);
        this.publicDir = (0, _path).join(this.dir, _constants.CLIENT_PUBLIC_FILES_PATH);
        this.hasStaticDir = !minimalMode && _fs.default.existsSync((0, _path).join(this.dir, 'static'));
        // Only serverRuntimeConfig needs the default
        // publicRuntimeConfig gets it's default in client/index.js
        const { serverRuntimeConfig ={
        } , publicRuntimeConfig , assetPrefix , generateEtags , compress ,  } = this.nextConfig;
        this.buildId = this.readBuildId();
        this.minimalMode = minimalMode;
        this.renderOpts = {
            poweredByHeader: this.nextConfig.poweredByHeader,
            canonicalBase: this.nextConfig.amp.canonicalBase || '',
            buildId: this.buildId,
            generateEtags,
            previewProps: this.getPreviewProps(),
            customServer: customServer === true ? true : undefined,
            ampOptimizerConfig: (ref = this.nextConfig.experimental.amp) === null || ref === void 0 ? void 0 : ref.optimizer,
            basePath: this.nextConfig.basePath,
            images: JSON.stringify(this.nextConfig.images),
            optimizeFonts: !!this.nextConfig.optimizeFonts && !dev,
            fontManifest: this.nextConfig.optimizeFonts && !dev ? (0, _require).requireFontManifest(this.distDir, this._isLikeServerless) : null,
            optimizeImages: !!this.nextConfig.experimental.optimizeImages,
            optimizeCss: this.nextConfig.experimental.optimizeCss,
            disableOptimizedLoading: this.nextConfig.experimental.disableOptimizedLoading,
            domainLocales: (ref1 = this.nextConfig.i18n) === null || ref1 === void 0 ? void 0 : ref1.domains,
            distDir: this.distDir
        };
        // Only the `publicRuntimeConfig` key is exposed to the client side
        // It'll be rendered as part of __NEXT_DATA__ on the client side
        if (Object.keys(publicRuntimeConfig).length > 0) {
            this.renderOpts.runtimeConfig = publicRuntimeConfig;
        }
        if (compress && this.nextConfig.target === 'server') {
            this.compression = (0, _compression).default();
        }
        // Initialize next/config with the environment configuration
        envConfig.setConfig({
            serverRuntimeConfig,
            publicRuntimeConfig
        });
        this.serverBuildDir = (0, _path).join(this.distDir, this._isLikeServerless ? _constants.SERVERLESS_DIRECTORY : _constants.SERVER_DIRECTORY);
        const pagesManifestPath = (0, _path).join(this.serverBuildDir, _constants.PAGES_MANIFEST);
        if (!dev) {
            this.pagesManifest = require(pagesManifestPath);
        }
        this.customRoutes = this.getCustomRoutes();
        this.router = new _router.default(this.generateRoutes());
        this.setAssetPrefix(assetPrefix);
        this.incrementalCache = new _incrementalCache.IncrementalCache({
            dev,
            distDir: this.distDir,
            pagesDir: (0, _path).join(this.distDir, this._isLikeServerless ? _constants.SERVERLESS_DIRECTORY : _constants.SERVER_DIRECTORY, 'pages'),
            locales: (ref2 = this.nextConfig.i18n) === null || ref2 === void 0 ? void 0 : ref2.locales,
            flushToDisk: !minimalMode && this.nextConfig.experimental.sprFlushToDisk
        });
        this.responseCache = new _responseCache.default(this.incrementalCache);
        /**
     * This sets environment variable to be used at the time of SSR by head.tsx.
     * Using this from process.env allows targeting both serverless and SSR by calling
     * `process.env.__NEXT_OPTIMIZE_IMAGES`.
     * TODO(atcastle@): Remove this when experimental.optimizeImages are being cleaned up.
     */ if (this.renderOpts.optimizeFonts) {
            process.env.__NEXT_OPTIMIZE_FONTS = JSON.stringify(true);
        }
        if (this.renderOpts.optimizeImages) {
            process.env.__NEXT_OPTIMIZE_IMAGES = JSON.stringify(true);
        }
        if (this.renderOpts.optimizeCss) {
            process.env.__NEXT_OPTIMIZE_CSS = JSON.stringify(true);
        }
    }
    logError(err) {
        if (this.quiet) return;
        console.error(err);
    }
    async handleRequest(req, res, parsedUrl) {
        var ref3;
        (0, _apiUtils).setLazyProp({
            req: req
        }, 'cookies', (0, _apiUtils).getCookieParser(req));
        // Parse url if parsedUrl not provided
        if (!parsedUrl || typeof parsedUrl !== 'object') {
            const url = req.url;
            parsedUrl = (0, _url).parse(url, true);
        }
        const { basePath , i18n  } = this.nextConfig;
        // Parse the querystring ourselves if the user doesn't handle querystring parsing
        if (typeof parsedUrl.query === 'string') {
            parsedUrl.query = (0, _querystring).parse(parsedUrl.query);
        }
        req.__NEXT_INIT_QUERY = Object.assign({
        }, parsedUrl.query);
        if (basePath && ((ref3 = req.url) === null || ref3 === void 0 ? void 0 : ref3.startsWith(basePath))) {
            req._nextHadBasePath = true;
            req.url = req.url.replace(basePath, '') || '/';
        }
        if (this.minimalMode && req.headers['x-matched-path'] && typeof req.headers['x-matched-path'] === 'string') {
            var ref4, ref5;
            const reqUrlIsDataUrl = (ref4 = req.url) === null || ref4 === void 0 ? void 0 : ref4.includes('/_next/data');
            const matchedPathIsDataUrl = (ref5 = req.headers['x-matched-path']) === null || ref5 === void 0 ? void 0 : ref5.includes('/_next/data');
            const isDataUrl = reqUrlIsDataUrl || matchedPathIsDataUrl;
            let parsedPath = (0, _url).parse(isDataUrl ? req.url : req.headers['x-matched-path'], true);
            const { pathname , query  } = parsedPath;
            let matchedPathname = pathname;
            let matchedPathnameNoExt = isDataUrl ? matchedPathname.replace(/\.json$/, '') : matchedPathname;
            if (i18n) {
                const localePathResult = (0, _normalizeLocalePath).normalizeLocalePath(matchedPathname || '/', i18n.locales);
                if (localePathResult.detectedLocale) {
                    parsedUrl.query.__nextLocale = localePathResult.detectedLocale;
                }
            }
            if (isDataUrl) {
                matchedPathname = (0, _denormalizePagePath).denormalizePagePath(matchedPathname);
                matchedPathnameNoExt = (0, _denormalizePagePath).denormalizePagePath(matchedPathnameNoExt);
            }
            const pageIsDynamic = (0, _utils).isDynamicRoute(matchedPathnameNoExt);
            const combinedRewrites = [];
            combinedRewrites.push(...this.customRoutes.rewrites.beforeFiles);
            combinedRewrites.push(...this.customRoutes.rewrites.afterFiles);
            combinedRewrites.push(...this.customRoutes.rewrites.fallback);
            const utils = (0, _utils3).getUtils({
                pageIsDynamic,
                page: matchedPathnameNoExt,
                i18n: this.nextConfig.i18n,
                basePath: this.nextConfig.basePath,
                rewrites: combinedRewrites
            });
            utils.handleRewrites(req, parsedUrl);
            // interpolate dynamic params and normalize URL if needed
            if (pageIsDynamic) {
                let params = {
                };
                Object.assign(parsedUrl.query, query);
                const paramsResult = utils.normalizeDynamicRouteParams(parsedUrl.query);
                if (paramsResult.hasValidParams) {
                    params = paramsResult.params;
                } else if (req.headers['x-now-route-matches']) {
                    const opts = {
                    };
                    params = utils.getParamsFromRouteMatches(req, opts, parsedUrl.query.__nextLocale || '');
                    if (opts.locale) {
                        parsedUrl.query.__nextLocale = opts.locale;
                    }
                } else {
                    params = utils.dynamicRouteMatcher(matchedPathnameNoExt);
                }
                if (params) {
                    params = utils.normalizeDynamicRouteParams(params).params;
                    matchedPathname = utils.interpolateDynamicPath(matchedPathname, params);
                    req.url = utils.interpolateDynamicPath(req.url, params);
                }
                if (reqUrlIsDataUrl && matchedPathIsDataUrl) {
                    req.url = (0, _url).format({
                        ...parsedPath,
                        pathname: matchedPathname
                    });
                }
                Object.assign(parsedUrl.query, params);
                utils.normalizeVercelUrl(req, true);
            }
            parsedUrl.pathname = `${basePath || ''}${matchedPathname === '/' && basePath ? '' : matchedPathname}`;
        }
        if (i18n) {
            // get pathname from URL with basePath stripped for locale detection
            let { pathname , ...parsed } = (0, _url).parse(req.url || '/');
            pathname = pathname || '/';
            let defaultLocale = i18n.defaultLocale;
            let detectedLocale = (0, _detectLocaleCookie).detectLocaleCookie(req, i18n.locales);
            let acceptPreferredLocale;
            try {
                acceptPreferredLocale = i18n.localeDetection !== false ? _accept.default.language(req.headers['accept-language'], i18n.locales) : detectedLocale;
            } catch (_) {
                acceptPreferredLocale = detectedLocale;
            }
            const { host  } = (req === null || req === void 0 ? void 0 : req.headers) || {
            };
            // remove port from host if present
            const hostname = host === null || host === void 0 ? void 0 : host.split(':')[0].toLowerCase();
            const detectedDomain = (0, _detectDomainLocale).detectDomainLocale(i18n.domains, hostname);
            if (detectedDomain) {
                defaultLocale = detectedDomain.defaultLocale;
                detectedLocale = defaultLocale;
                req.__nextIsLocaleDomain = true;
            }
            // if not domain specific locale use accept-language preferred
            detectedLocale = detectedLocale || acceptPreferredLocale;
            let localeDomainRedirect;
            req.__nextHadTrailingSlash = pathname.endsWith('/');
            if (pathname === '/') {
                req.__nextHadTrailingSlash = this.nextConfig.trailingSlash;
            }
            const localePathResult = (0, _normalizeLocalePath).normalizeLocalePath(pathname, i18n.locales);
            if (localePathResult.detectedLocale) {
                detectedLocale = localePathResult.detectedLocale;
                req.url = (0, _url).format({
                    ...parsed,
                    pathname: localePathResult.pathname
                });
                req.__nextStrippedLocale = true;
                if (localePathResult.pathname === '/api' || localePathResult.pathname.startsWith('/api/')) {
                    return this.render404(req, res, parsedUrl);
                }
            }
            // If a detected locale is a domain specific locale and we aren't already
            // on that domain and path prefix redirect to it to prevent duplicate
            // content from multiple domains
            if (detectedDomain && pathname === '/') {
                const localeToCheck = acceptPreferredLocale;
                // const localeToCheck = localePathResult.detectedLocale
                //   ? detectedLocale
                //   : acceptPreferredLocale
                const matchedDomain = (0, _detectDomainLocale).detectDomainLocale(i18n.domains, undefined, localeToCheck);
                if (matchedDomain && (matchedDomain.domain !== detectedDomain.domain || localeToCheck !== matchedDomain.defaultLocale)) {
                    localeDomainRedirect = `http${matchedDomain.http ? '' : 's'}://${matchedDomain.domain}/${localeToCheck === matchedDomain.defaultLocale ? '' : localeToCheck}`;
                }
            }
            const denormalizedPagePath = (0, _denormalizePagePath).denormalizePagePath(pathname || '/');
            const detectedDefaultLocale = !detectedLocale || detectedLocale.toLowerCase() === defaultLocale.toLowerCase();
            const shouldStripDefaultLocale = false;
            // detectedDefaultLocale &&
            // denormalizedPagePath.toLowerCase() ===
            //   `/${i18n.defaultLocale.toLowerCase()}`
            const shouldAddLocalePrefix = !detectedDefaultLocale && denormalizedPagePath === '/';
            detectedLocale = detectedLocale || i18n.defaultLocale;
            if (i18n.localeDetection !== false && (localeDomainRedirect || shouldAddLocalePrefix || shouldStripDefaultLocale)) {
                // set the NEXT_LOCALE cookie when a user visits the default locale
                // with the locale prefix so that they aren't redirected back to
                // their accept-language preferred locale
                if (shouldStripDefaultLocale && acceptPreferredLocale !== defaultLocale) {
                    const previous = res.getHeader('set-cookie');
                    res.setHeader('set-cookie', [
                        ...typeof previous === 'string' ? [
                            previous
                        ] : Array.isArray(previous) ? previous : [],
                        _cookie.default.serialize('NEXT_LOCALE', defaultLocale, {
                            httpOnly: true,
                            path: '/'
                        }), 
                    ]);
                }
                res.setHeader('Location', localeDomainRedirect ? localeDomainRedirect : (0, _url).format({
                    // make sure to include any query values when redirecting
                    ...parsed,
                    pathname: shouldStripDefaultLocale ? basePath || `/` : `${basePath || ''}/${detectedLocale}`
                }));
                res.statusCode = _constants.TEMPORARY_REDIRECT_STATUS;
                res.end();
                return;
            }
            parsedUrl.query.__nextDefaultLocale = (detectedDomain === null || detectedDomain === void 0 ? void 0 : detectedDomain.defaultLocale) || i18n.defaultLocale;
            if (!this.minimalMode || !parsedUrl.query.__nextLocale) {
                parsedUrl.query.__nextLocale = localePathResult.detectedLocale || (detectedDomain === null || detectedDomain === void 0 ? void 0 : detectedDomain.defaultLocale) || defaultLocale;
            }
        }
        res.statusCode = 200;
        try {
            return await this.run(req, res, parsedUrl);
        } catch (err) {
            if (this.minimalMode) {
                throw err;
            }
            this.logError(err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    }
    getRequestHandler() {
        return this.handleRequest.bind(this);
    }
    setAssetPrefix(prefix) {
        this.renderOpts.assetPrefix = prefix ? prefix.replace(/\/$/, '') : '';
    }
    // Backwards compatibility
    async prepare() {
    }
    // Backwards compatibility
    async close() {
    }
    setImmutableAssetCacheControl(res) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    getCustomRoutes() {
        const customRoutes = require((0, _path).join(this.distDir, _constants.ROUTES_MANIFEST));
        let rewrites;
        // rewrites can be stored as an array when an array is
        // returned in next.config.js so massage them into
        // the expected object format
        if (Array.isArray(customRoutes.rewrites)) {
            rewrites = {
                beforeFiles: [],
                afterFiles: customRoutes.rewrites,
                fallback: []
            };
        } else {
            rewrites = customRoutes.rewrites;
        }
        return Object.assign(customRoutes, {
            rewrites
        });
    }
    getPrerenderManifest() {
        if (this._cachedPreviewManifest) {
            return this._cachedPreviewManifest;
        }
        const manifest = require((0, _path).join(this.distDir, _constants.PRERENDER_MANIFEST));
        return this._cachedPreviewManifest = manifest;
    }
    getPreviewProps() {
        return this.getPrerenderManifest().preview;
    }
    generateRoutes() {
        var ref6;
        const server = this;
        const publicRoutes = _fs.default.existsSync(this.publicDir) ? this.generatePublicRoutes() : [];
        const staticFilesRoute = this.hasStaticDir ? [
            {
                // It's very important to keep this route's param optional.
                // (but it should support as many params as needed, separated by '/')
                // Otherwise this will lead to a pretty simple DOS attack.
                // See more: https://github.com/vercel/next.js/issues/2617
                match: (0, _router).route('/static/:path*'),
                name: 'static catchall',
                fn: async (req, res, params, parsedUrl)=>{
                    const p = (0, _path).join(this.dir, 'static', ...params.path);
                    await this.serveStatic(req, res, p, parsedUrl);
                    return {
                        finished: true
                    };
                }
            }, 
        ] : [];
        const fsRoutes = [
            {
                match: (0, _router).route('/_next/static/:path*'),
                type: 'route',
                name: '_next/static catchall',
                fn: async (req, res, params, parsedUrl)=>{
                    // make sure to 404 for /_next/static itself
                    if (!params.path) {
                        await this.render404(req, res, parsedUrl);
                        return {
                            finished: true
                        };
                    }
                    if (params.path[0] === _constants.CLIENT_STATIC_FILES_RUNTIME || params.path[0] === 'chunks' || params.path[0] === 'css' || params.path[0] === 'image' || params.path[0] === 'media' || params.path[0] === this.buildId || params.path[0] === 'pages' || params.path[1] === 'pages') {
                        this.setImmutableAssetCacheControl(res);
                    }
                    const p = (0, _path).join(this.distDir, _constants.CLIENT_STATIC_FILES_PATH, ...params.path || []);
                    await this.serveStatic(req, res, p, parsedUrl);
                    return {
                        finished: true
                    };
                }
            },
            {
                match: (0, _router).route('/_next/data/:path*'),
                type: 'route',
                name: '_next/data catchall',
                fn: async (req, res, params, _parsedUrl)=>{
                    // Make sure to 404 for /_next/data/ itself and
                    // we also want to 404 if the buildId isn't correct
                    if (!params.path || params.path[0] !== this.buildId) {
                        await this.render404(req, res, _parsedUrl);
                        return {
                            finished: true
                        };
                    }
                    // remove buildId from URL
                    params.path.shift();
                    // show 404 if it doesn't end with .json
                    if (!params.path[params.path.length - 1].endsWith('.json')) {
                        await this.render404(req, res, _parsedUrl);
                        return {
                            finished: true
                        };
                    }
                    // re-create page's pathname
                    let pathname = `/${params.path.join('/')}`;
                    pathname = (0, _getRouteFromAssetPath).default(pathname, '.json');
                    const { i18n  } = this.nextConfig;
                    if (i18n) {
                        const { host  } = (req === null || req === void 0 ? void 0 : req.headers) || {
                        };
                        // remove port from host and remove port if present
                        const hostname = host === null || host === void 0 ? void 0 : host.split(':')[0].toLowerCase();
                        const localePathResult = (0, _normalizeLocalePath).normalizeLocalePath(pathname, i18n.locales);
                        const { defaultLocale  } = (0, _detectDomainLocale).detectDomainLocale(i18n.domains, hostname) || {
                        };
                        let detectedLocale = '';
                        if (localePathResult.detectedLocale) {
                            pathname = localePathResult.pathname;
                            detectedLocale = localePathResult.detectedLocale;
                        }
                        _parsedUrl.query.__nextLocale = detectedLocale;
                        _parsedUrl.query.__nextDefaultLocale = defaultLocale || i18n.defaultLocale;
                        if (!detectedLocale) {
                            _parsedUrl.query.__nextLocale = _parsedUrl.query.__nextDefaultLocale;
                            await this.render404(req, res, _parsedUrl);
                            return {
                                finished: true
                            };
                        }
                    }
                    const parsedUrl = (0, _url).parse(pathname, true);
                    await this.render(req, res, pathname, {
                        ..._parsedUrl.query,
                        _nextDataReq: '1'
                    }, parsedUrl);
                    return {
                        finished: true
                    };
                }
            },
            {
                match: (0, _router).route('/_next/image'),
                type: 'route',
                name: '_next/image catchall',
                fn: (req, res, _params, parsedUrl)=>(0, _imageOptimizer).imageOptimizer(server, req, res, parsedUrl, server.nextConfig, server.distDir, this.renderOpts.dev)
            },
            {
                match: (0, _router).route('/_next/:path*'),
                type: 'route',
                name: '_next catchall',
                // This path is needed because `render()` does a check for `/_next` and the calls the routing again
                fn: async (req, res, _params, parsedUrl)=>{
                    await this.render404(req, res, parsedUrl);
                    return {
                        finished: true
                    };
                }
            },
            ...publicRoutes,
            ...staticFilesRoute, 
        ];
        const restrictedRedirectPaths = [
            '/_next'
        ].map((p)=>this.nextConfig.basePath ? `${this.nextConfig.basePath}${p}` : p
        );
        const getCustomRoute = (r, type)=>{
            const match = getCustomRouteMatcher(r.source, !r.internal ? (regex)=>(0, _loadCustomRoutes).modifyRouteRegex(regex, type === 'redirect' ? restrictedRedirectPaths : undefined)
             : undefined);
            return {
                ...r,
                type,
                match,
                name: type,
                fn: async (_req, _res, _params, _parsedUrl)=>({
                        finished: false
                    })
            };
        };
        // Headers come very first
        const headers = this.minimalMode ? [] : this.customRoutes.headers.map((r)=>{
            const headerRoute = getCustomRoute(r, 'header');
            return {
                match: headerRoute.match,
                has: headerRoute.has,
                type: headerRoute.type,
                name: `${headerRoute.type} ${headerRoute.source} header route`,
                fn: async (_req, res, params, _parsedUrl)=>{
                    const hasParams = Object.keys(params).length > 0;
                    for (const header of headerRoute.headers){
                        let { key , value  } = header;
                        if (hasParams) {
                            key = (0, _prepareDestination).compileNonPath(key, params);
                            value = (0, _prepareDestination).compileNonPath(value, params);
                        }
                        res.setHeader(key, value);
                    }
                    return {
                        finished: false
                    };
                }
            };
        });
        // since initial query values are decoded by querystring.parse
        // we need to re-encode them here but still allow passing through
        // values from rewrites/redirects
        const stringifyQuery = (req, query)=>{
            const initialQueryValues = Object.values(req.__NEXT_INIT_QUERY);
            return (0, _querystring).stringify(query, undefined, undefined, {
                encodeURIComponent (value) {
                    if (initialQueryValues.some((val)=>val === value
                    )) {
                        return encodeURIComponent(value);
                    }
                    return value;
                }
            });
        };
        const redirects = this.minimalMode ? [] : this.customRoutes.redirects.map((redirect)=>{
            const redirectRoute = getCustomRoute(redirect, 'redirect');
            return {
                internal: redirectRoute.internal,
                type: redirectRoute.type,
                match: redirectRoute.match,
                has: redirectRoute.has,
                statusCode: redirectRoute.statusCode,
                name: `Redirect route ${redirectRoute.source}`,
                fn: async (req, res, params, parsedUrl)=>{
                    const { parsedDestination  } = (0, _prepareDestination).default(redirectRoute.destination, params, parsedUrl.query, false);
                    const { query  } = parsedDestination;
                    delete parsedDestination.query;
                    parsedDestination.search = stringifyQuery(req, query);
                    const updatedDestination = (0, _url).format(parsedDestination);
                    res.setHeader('Location', updatedDestination);
                    res.statusCode = (0, _loadCustomRoutes).getRedirectStatus(redirectRoute);
                    // Since IE11 doesn't support the 308 header add backwards
                    // compatibility using refresh header
                    if (res.statusCode === 308) {
                        res.setHeader('Refresh', `0;url=${updatedDestination}`);
                    }
                    res.end();
                    return {
                        finished: true
                    };
                }
            };
        });
        const buildRewrite = (rewrite, check = true)=>{
            const rewriteRoute = getCustomRoute(rewrite, 'rewrite');
            return {
                ...rewriteRoute,
                check,
                type: rewriteRoute.type,
                name: `Rewrite route ${rewriteRoute.source}`,
                match: rewriteRoute.match,
                fn: async (req, res, params, parsedUrl)=>{
                    const { newUrl , parsedDestination  } = (0, _prepareDestination).default(rewriteRoute.destination, params, parsedUrl.query, true);
                    // external rewrite, proxy it
                    if (parsedDestination.protocol) {
                        const { query  } = parsedDestination;
                        delete parsedDestination.query;
                        parsedDestination.search = stringifyQuery(req, query);
                        const target = (0, _url).format(parsedDestination);
                        const proxy = new _httpProxy.default({
                            target,
                            changeOrigin: true,
                            ignorePath: true,
                            xfwd: true,
                            proxyTimeout: 30000
                        });
                        await new Promise((proxyResolve, proxyReject)=>{
                            let finished = false;
                            proxy.on('proxyReq', (proxyReq)=>{
                                proxyReq.on('close', ()=>{
                                    if (!finished) {
                                        finished = true;
                                        proxyResolve(true);
                                    }
                                });
                            });
                            proxy.on('error', (err)=>{
                                if (!finished) {
                                    finished = true;
                                    proxyReject(err);
                                }
                            });
                            proxy.web(req, res);
                        });
                        return {
                            finished: true
                        };
                    }
                    req._nextRewroteUrl = newUrl;
                    req._nextDidRewrite = req._nextRewroteUrl !== req.url;
                    return {
                        finished: false,
                        pathname: newUrl,
                        query: parsedDestination.query
                    };
                }
            };
        };
        let beforeFiles = [];
        let afterFiles = [];
        let fallback = [];
        if (!this.minimalMode) {
            if (Array.isArray(this.customRoutes.rewrites)) {
                afterFiles = this.customRoutes.rewrites.map((r)=>buildRewrite(r)
                );
            } else {
                beforeFiles = this.customRoutes.rewrites.beforeFiles.map((r)=>buildRewrite(r, false)
                );
                afterFiles = this.customRoutes.rewrites.afterFiles.map((r)=>buildRewrite(r)
                );
                fallback = this.customRoutes.rewrites.fallback.map((r)=>buildRewrite(r)
                );
            }
        }
        const catchAllRoute = {
            match: (0, _router).route('/:path*'),
            type: 'route',
            name: 'Catchall render',
            fn: async (req, res, _params, parsedUrl)=>{
                let { pathname , query  } = parsedUrl;
                if (!pathname) {
                    throw new Error('pathname is undefined');
                }
                // next.js core assumes page path without trailing slash
                pathname = (0, _normalizeTrailingSlash).removePathTrailingSlash(pathname);
                if (this.nextConfig.i18n) {
                    var ref7;
                    const localePathResult = (0, _normalizeLocalePath).normalizeLocalePath(pathname, (ref7 = this.nextConfig.i18n) === null || ref7 === void 0 ? void 0 : ref7.locales);
                    if (localePathResult.detectedLocale) {
                        pathname = localePathResult.pathname;
                        parsedUrl.query.__nextLocale = localePathResult.detectedLocale;
                    }
                }
                const bubbleNoFallback = !!query._nextBubbleNoFallback;
                if (pathname === '/api' || pathname.startsWith('/api/')) {
                    delete query._nextBubbleNoFallback;
                    const handled = await this.handleApiRequest(req, res, pathname, query);
                    if (handled) {
                        return {
                            finished: true
                        };
                    }
                }
                try {
                    await this.render(req, res, pathname, query, parsedUrl);
                    return {
                        finished: true
                    };
                } catch (err) {
                    if (err instanceof NoFallbackError && bubbleNoFallback) {
                        return {
                            finished: false
                        };
                    }
                    throw err;
                }
            }
        };
        const { useFileSystemPublicRoutes  } = this.nextConfig;
        if (useFileSystemPublicRoutes) {
            this.dynamicRoutes = this.getDynamicRoutes();
        }
        return {
            headers,
            fsRoutes,
            rewrites: {
                beforeFiles,
                afterFiles,
                fallback
            },
            redirects,
            catchAllRoute,
            useFileSystemPublicRoutes,
            dynamicRoutes: this.dynamicRoutes,
            basePath: this.nextConfig.basePath,
            pageChecker: this.hasPage.bind(this),
            locales: ((ref6 = this.nextConfig.i18n) === null || ref6 === void 0 ? void 0 : ref6.locales) || []
        };
    }
    async getPagePath(pathname, locales) {
        return (0, _require).getPagePath(pathname, this.distDir, this._isLikeServerless, this.renderOpts.dev, locales);
    }
    async hasPage(pathname) {
        let found = false;
        try {
            var ref8;
            found = !!await this.getPagePath(pathname, (ref8 = this.nextConfig.i18n) === null || ref8 === void 0 ? void 0 : ref8.locales);
        } catch (_) {
        }
        return found;
    }
    async _beforeCatchAllRender(_req, _res, _params, _parsedUrl) {
        return false;
    }
    // Used to build API page in development
    async ensureApiPage(_pathname) {
    }
    /**
   * Resolves `API` request, in development builds on demand
   * @param req http request
   * @param res http response
   * @param pathname path of request
   */ async handleApiRequest(req, res, pathname, query) {
        let page = pathname;
        let params = false;
        let pageFound = await this.hasPage(page);
        if (!pageFound && this.dynamicRoutes) {
            for (const dynamicRoute of this.dynamicRoutes){
                params = dynamicRoute.match(pathname);
                if (dynamicRoute.page.startsWith('/api') && params) {
                    page = dynamicRoute.page;
                    pageFound = true;
                    break;
                }
            }
        }
        if (!pageFound) {
            return false;
        }
        // Make sure the page is built before getting the path
        // or else it won't be in the manifest yet
        await this.ensureApiPage(page);
        let builtPagePath;
        try {
            builtPagePath = await this.getPagePath(page);
        } catch (err) {
            if (err.code === 'ENOENT') {
                return false;
            }
            throw err;
        }
        const pageModule = await require(builtPagePath);
        query = {
            ...query,
            ...params
        };
        delete query.__nextLocale;
        delete query.__nextDefaultLocale;
        if (!this.renderOpts.dev && this._isLikeServerless) {
            if (typeof pageModule.default === 'function') {
                prepareServerlessUrl(req, query);
                await pageModule.default(req, res);
                return true;
            }
        }
        await (0, _apiUtils).apiResolver(req, res, query, pageModule, this.renderOpts.previewProps, this.minimalMode);
        return true;
    }
    generatePublicRoutes() {
        const publicFiles = new Set((0, _recursiveReaddirSync).recursiveReadDirSync(this.publicDir).map((p)=>encodeURI(p.replace(/\\/g, '/'))
        ));
        return [
            {
                match: (0, _router).route('/:path*'),
                name: 'public folder catchall',
                fn: async (req, res, params, parsedUrl)=>{
                    const pathParts = params.path || [];
                    const { basePath  } = this.nextConfig;
                    // if basePath is defined require it be present
                    if (basePath) {
                        const basePathParts = basePath.split('/');
                        // remove first empty value
                        basePathParts.shift();
                        if (!basePathParts.every((part, idx)=>{
                            return part === pathParts[idx];
                        })) {
                            return {
                                finished: false
                            };
                        }
                        pathParts.splice(0, basePathParts.length);
                    }
                    const path = `/${pathParts.join('/')}`;
                    if (publicFiles.has(path)) {
                        await this.serveStatic(req, res, (0, _path).join(this.publicDir, ...pathParts), parsedUrl);
                        return {
                            finished: true
                        };
                    }
                    return {
                        finished: false
                    };
                }
            }, 
        ];
    }
    getDynamicRoutes() {
        var ref9;
        const addedPages = new Set();
        return (0, _utils).getSortedRoutes(Object.keys(this.pagesManifest).map((page)=>(0, _normalizeLocalePath).normalizeLocalePath(page, (ref9 = this.nextConfig.i18n) === null || ref9 === void 0 ? void 0 : ref9.locales).pathname
        )).map((page)=>{
            if (addedPages.has(page) || !(0, _utils).isDynamicRoute(page)) return null;
            addedPages.add(page);
            return {
                page,
                match: (0, _utils).getRouteMatcher((0, _utils).getRouteRegex(page))
            };
        }).filter((item)=>Boolean(item)
        );
    }
    handleCompression(req, res) {
        if (this.compression) {
            this.compression(req, res, ()=>{
            });
        }
    }
    async run(req, res, parsedUrl) {
        this.handleCompression(req, res);
        try {
            const matched = await this.router.execute(req, res, parsedUrl);
            if (matched) {
                return;
            }
        } catch (err) {
            if (err instanceof _utils1.DecodeError) {
                res.statusCode = 400;
                return this.renderError(null, req, res, '/_error', {
                });
            }
            throw err;
        }
        await this.render404(req, res, parsedUrl);
    }
    async sendResponse(req, res, { type , body , revalidateOptions  }) {
        if (!(0, _utils1).isResSent(res)) {
            const { generateEtags: generateEtags1 , poweredByHeader , dev: dev1  } = this.renderOpts;
            if (dev1) {
                // In dev, we should not cache pages for any reason.
                res.setHeader('Cache-Control', 'no-store, must-revalidate');
            }
            return (0, _sendPayload).sendPayload(req, res, body, type, {
                generateEtags: generateEtags1,
                poweredByHeader
            }, revalidateOptions);
        }
    }
    async render(req, res, pathname, query = {
    }, parsedUrl) {
        if (!pathname.startsWith('/')) {
            console.warn(`Cannot render page with path "${pathname}", did you mean "/${pathname}"?. See more info here: https://nextjs.org/docs/messages/render-no-starting-slash`);
        }
        if (this.renderOpts.customServer && pathname === '/index' && !await this.hasPage('/index')) {
            // maintain backwards compatibility for custom server
            // (see custom-server integration tests)
            pathname = '/';
        }
        const url = req.url;
        // we allow custom servers to call render for all URLs
        // so check if we need to serve a static _next file or not.
        // we don't modify the URL for _next/data request but still
        // call render so we special case this to prevent an infinite loop
        if (!this.minimalMode && !query._nextDataReq && (url.match(/^\/_next\//) || this.hasStaticDir && url.match(/^\/static\//))) {
            return this.handleRequest(req, res, parsedUrl);
        }
        // Custom server users can run `app.render()` which needs compression.
        if (this.renderOpts.customServer) {
            this.handleCompression(req, res);
        }
        if ((0, _utils2).isBlockedPage(pathname)) {
            return this.render404(req, res, parsedUrl);
        }
        const response = await this.renderToResponse(req, res, pathname, query);
        // Request was ended by the user
        if (response === null) {
            return;
        }
        return this.sendResponse(req, res, response);
    }
    async findPageComponents(pathname, query = {
    }, params = null) {
        let paths = [
            // try serving a static AMP version first
            query.amp ? (0, _normalizePagePath).normalizePagePath(pathname) + '.amp' : null,
            pathname, 
        ].filter(Boolean);
        if (query.__nextLocale) {
            paths = [
                ...paths.map((path)=>`/${query.__nextLocale}${path === '/' ? '' : path}`
                ),
                ...paths, 
            ];
        }
        for (const pagePath of paths){
            try {
                const components = await (0, _loadComponents).loadComponents(this.distDir, pagePath, !this.renderOpts.dev && this._isLikeServerless);
                if (query.__nextLocale && typeof components.Component === 'string' && !(pagePath === null || pagePath === void 0 ? void 0 : pagePath.startsWith(`/${query.__nextLocale}`))) {
                    continue;
                }
                return {
                    components,
                    query: {
                        ...components.getStaticProps ? {
                            amp: query.amp,
                            _nextDataReq: query._nextDataReq,
                            __nextLocale: query.__nextLocale,
                            __nextDefaultLocale: query.__nextDefaultLocale
                        } : query,
                        ...params || {
                        }
                    }
                };
            } catch (err) {
                if (err.code !== 'ENOENT') throw err;
            }
        }
        return null;
    }
    async getStaticPaths(pathname) {
        // `staticPaths` is intentionally set to `undefined` as it should've
        // been caught when checking disk data.
        const staticPaths = undefined;
        // Read whether or not fallback should exist from the manifest.
        const fallbackField = this.getPrerenderManifest().dynamicRoutes[pathname].fallback;
        return {
            staticPaths,
            fallbackMode: typeof fallbackField === 'string' ? 'static' : fallbackField === null ? 'blocking' : false
        };
    }
    async renderToResponseWithComponents(req, res, pathname, { components , query  }, opts) {
        var ref10, ref11;
        const is404Page = pathname === '/404';
        const is500Page = pathname === '/500';
        const isLikeServerless = typeof components.Component === 'object' && typeof components.Component.renderReqToHTML === 'function';
        const isSSG = !!components.getStaticProps;
        const hasServerProps = !!components.getServerSideProps;
        const hasStaticPaths = !!components.getStaticPaths;
        const hasGetInitialProps = !!components.Component.getInitialProps;
        // Toggle whether or not this is a Data request
        const isDataReq = !!query._nextDataReq && (isSSG || hasServerProps);
        delete query._nextDataReq;
        // we need to ensure the status code if /404 is visited directly
        if (is404Page && !isDataReq) {
            res.statusCode = 404;
        }
        // ensure correct status is set when visiting a status page
        // directly e.g. /500
        if (_constants.STATIC_STATUS_PAGES.includes(pathname)) {
            res.statusCode = parseInt(pathname.substr(1), 10);
        }
        // handle static page
        if (typeof components.Component === 'string') {
            return {
                type: 'html',
                body: components.Component
            };
        }
        if (!query.amp) {
            delete query.amp;
        }
        const locale = query.__nextLocale;
        const defaultLocale = isSSG ? (ref10 = this.nextConfig.i18n) === null || ref10 === void 0 ? void 0 : ref10.defaultLocale : query.__nextDefaultLocale;
        const { i18n  } = this.nextConfig;
        const locales = i18n === null || i18n === void 0 ? void 0 : i18n.locales;
        let previewData;
        let isPreviewMode = false;
        if (hasServerProps || isSSG) {
            previewData = (0, _apiUtils).tryGetPreviewData(req, res, this.renderOpts.previewProps);
            isPreviewMode = previewData !== false;
        }
        // Compute the iSSG cache key. We use the rewroteUrl since
        // pages with fallback: false are allowed to be rewritten to
        // and we need to look up the path by the rewritten path
        let urlPathname = (0, _url).parse(req.url || '').pathname || '/';
        let resolvedUrlPathname = req._nextRewroteUrl ? req._nextRewroteUrl : urlPathname;
        urlPathname = (0, _normalizeTrailingSlash).removePathTrailingSlash(urlPathname);
        resolvedUrlPathname = (0, _normalizeLocalePath).normalizeLocalePath((0, _normalizeTrailingSlash).removePathTrailingSlash(resolvedUrlPathname), (ref11 = this.nextConfig.i18n) === null || ref11 === void 0 ? void 0 : ref11.locales).pathname;
        const stripNextDataPath = (path)=>{
            if (path.includes(this.buildId)) {
                const splitPath = path.substring(path.indexOf(this.buildId) + this.buildId.length);
                path = (0, _denormalizePagePath).denormalizePagePath(splitPath.replace(/\.json$/, ''));
            }
            if (this.nextConfig.i18n) {
                return (0, _normalizeLocalePath).normalizeLocalePath(path, locales).pathname;
            }
            return path;
        };
        const handleRedirect = (pageData)=>{
            const redirect = {
                destination: pageData.pageProps.__N_REDIRECT,
                statusCode: pageData.pageProps.__N_REDIRECT_STATUS,
                basePath: pageData.pageProps.__N_REDIRECT_BASE_PATH
            };
            const statusCode = (0, _loadCustomRoutes).getRedirectStatus(redirect);
            const { basePath  } = this.nextConfig;
            if (basePath && redirect.basePath !== false && redirect.destination.startsWith('/')) {
                redirect.destination = `${basePath}${redirect.destination}`;
            }
            if (statusCode === _constants.PERMANENT_REDIRECT_STATUS) {
                res.setHeader('Refresh', `0;url=${redirect.destination}`);
            }
            res.statusCode = statusCode;
            res.setHeader('Location', redirect.destination);
            res.end();
        };
        // remove /_next/data prefix from urlPathname so it matches
        // for direct page visit and /_next/data visit
        if (isDataReq) {
            resolvedUrlPathname = stripNextDataPath(resolvedUrlPathname);
            urlPathname = stripNextDataPath(urlPathname);
        }
        let ssgCacheKey = isPreviewMode || !isSSG || this.minimalMode ? null // Preview mode bypasses the cache
         : `${locale ? `/${locale}` : ''}${(pathname === '/' || resolvedUrlPathname === '/') && locale ? '' : resolvedUrlPathname}${query.amp ? '.amp' : ''}`;
        if ((is404Page || is500Page) && isSSG) {
            ssgCacheKey = `${locale ? `/${locale}` : ''}${pathname}${query.amp ? '.amp' : ''}`;
        }
        if (ssgCacheKey) {
            // we only encode path delimiters for path segments from
            // getStaticPaths so we need to attempt decoding the URL
            // to match against and only escape the path delimiters
            // this allows non-ascii values to be handled e.g. Japanese characters
            // TODO: investigate adding this handling for non-SSG pages so
            // non-ascii names work there also
            ssgCacheKey = ssgCacheKey.split('/').map((seg)=>{
                try {
                    seg = (0, _escapePathDelimiters).default(decodeURIComponent(seg), true);
                } catch (_) {
                    // An improperly encoded URL was provided
                    throw new _utils1.DecodeError('failed to decode param');
                }
                return seg;
            }).join('/');
        }
        const doRender = async ()=>{
            let pageData;
            let html;
            let sprRevalidate;
            let isNotFound;
            let isRedirect;
            let renderResult;
            // handle serverless
            if (isLikeServerless) {
                renderResult = await components.Component.renderReqToHTML(req, res, 'passthrough', {
                    locale,
                    locales,
                    defaultLocale,
                    optimizeCss: this.renderOpts.optimizeCss,
                    distDir: this.distDir,
                    fontManifest: this.renderOpts.fontManifest,
                    domainLocales: this.renderOpts.domainLocales
                });
                html = renderResult.html;
                pageData = renderResult.renderOpts.pageData;
                sprRevalidate = renderResult.renderOpts.revalidate;
                isNotFound = renderResult.renderOpts.isNotFound;
                isRedirect = renderResult.renderOpts.isRedirect;
            } else {
                const origQuery = (0, _url).parse(req.url || '', true).query;
                const hadTrailingSlash = urlPathname !== '/' && this.nextConfig.trailingSlash;
                const resolvedUrl = (0, _url).format({
                    pathname: `${resolvedUrlPathname}${hadTrailingSlash ? '/' : ''}`,
                    // make sure to only add query values from original URL
                    query: origQuery
                });
                const renderOpts = {
                    ...components,
                    ...opts,
                    isDataReq,
                    resolvedUrl,
                    locale,
                    locales,
                    defaultLocale,
                    // For getServerSideProps and getInitialProps we need to ensure we use the original URL
                    // and not the resolved URL to prevent a hydration mismatch on
                    // asPath
                    resolvedAsPath: hasServerProps || hasGetInitialProps ? (0, _url).format({
                        // we use the original URL pathname less the _next/data prefix if
                        // present
                        pathname: `${urlPathname}${hadTrailingSlash ? '/' : ''}`,
                        query: origQuery
                    }) : resolvedUrl
                };
                renderResult = await (0, _render).renderToHTML(req, res, pathname, query, renderOpts);
                html = renderResult;
                // TODO: change this to a different passing mechanism
                pageData = renderOpts.pageData;
                sprRevalidate = renderOpts.revalidate;
                isNotFound = renderOpts.isNotFound;
                isRedirect = renderOpts.isRedirect;
            }
            let value;
            if (isNotFound) {
                value = null;
            } else if (isRedirect) {
                value = {
                    kind: 'REDIRECT',
                    props: pageData
                };
            } else {
                value = {
                    kind: 'PAGE',
                    html: html,
                    pageData
                };
            }
            return {
                revalidate: sprRevalidate,
                value
            };
        };
        const cacheEntry = await this.responseCache.get(ssgCacheKey, async (hasResolved)=>{
            const isProduction = !this.renderOpts.dev;
            const isDynamicPathname = (0, _utils).isDynamicRoute(pathname);
            const didRespond = hasResolved || (0, _utils1).isResSent(res);
            const { staticPaths , fallbackMode  } = hasStaticPaths ? await this.getStaticPaths(pathname) : {
                staticPaths: undefined,
                fallbackMode: false
            };
            // When we did not respond from cache, we need to choose to block on
            // rendering or return a skeleton.
            //
            // * Data requests always block.
            //
            // * Blocking mode fallback always blocks.
            //
            // * Preview mode toggles all pages to be resolved in a blocking manner.
            //
            // * Non-dynamic pages should block (though this is an impossible
            //   case in production).
            //
            // * Dynamic pages should return their skeleton if not defined in
            //   getStaticPaths, then finish the data request on the client-side.
            //
            if (this.minimalMode !== true && fallbackMode !== 'blocking' && ssgCacheKey && !didRespond && !isPreviewMode && isDynamicPathname && // Development should trigger fallback when the path is not in
            // `getStaticPaths`
            (isProduction || !staticPaths || !staticPaths.includes(// we use ssgCacheKey here as it is normalized to match the
            // encoding from getStaticPaths along with including the locale
            query.amp ? ssgCacheKey.replace(/\.amp$/, '') : ssgCacheKey))) {
                if (// In development, fall through to render to handle missing
                // getStaticPaths.
                (isProduction || staticPaths) && // When fallback isn't present, abort this render so we 404
                fallbackMode !== 'static') {
                    throw new NoFallbackError();
                }
                if (!isDataReq) {
                    // Production already emitted the fallback as static HTML.
                    if (isProduction) {
                        const html = await this.incrementalCache.getFallback(locale ? `/${locale}${pathname}` : pathname);
                        return {
                            value: {
                                kind: 'PAGE',
                                html,
                                pageData: {
                                }
                            }
                        };
                    } else {
                        query.__nextFallback = 'true';
                        if (isLikeServerless) {
                            prepareServerlessUrl(req, query);
                        }
                        const result = await doRender();
                        // Prevent caching this result
                        delete result.revalidate;
                        return result;
                    }
                }
            }
            const result = await doRender();
            return {
                ...result,
                revalidate: result.revalidate !== undefined ? result.revalidate : /* default to minimum revalidate (this should be an invariant) */ 1
            };
        });
        const { revalidate , value: cachedData  } = cacheEntry;
        const revalidateOptions = typeof revalidate !== 'undefined' && (!this.renderOpts.dev || hasServerProps && !isDataReq) ? {
            // When the page is 404 cache-control should not be added
            private: isPreviewMode || is404Page,
            stateful: !isSSG,
            revalidate
        } : undefined;
        if (!cachedData) {
            if (revalidateOptions) {
                (0, _sendPayload).setRevalidateHeaders(res, revalidateOptions);
            }
            if (isDataReq) {
                res.statusCode = 404;
                res.end('{"notFound":true}');
                return null;
            } else {
                await this.render404(req, res, {
                    pathname,
                    query
                });
                return null;
            }
        } else if (cachedData.kind === 'REDIRECT') {
            if (isDataReq) {
                return {
                    type: 'json',
                    body: JSON.stringify(cachedData.props),
                    revalidateOptions
                };
            } else {
                await handleRedirect(cachedData.props);
                return null;
            }
        } else {
            return {
                type: isDataReq ? 'json' : 'html',
                body: isDataReq ? JSON.stringify(cachedData.pageData) : cachedData.html,
                revalidateOptions
            };
        }
    }
    async renderToResponse(req, res, pathname, query = {
    }) {
        const bubbleNoFallback = !!query._nextBubbleNoFallback;
        delete query._nextBubbleNoFallback;
        try {
            const result = await this.findPageComponents(pathname, query);
            if (result) {
                try {
                    return await this.renderToResponseWithComponents(req, res, pathname, result, {
                        ...this.renderOpts
                    });
                } catch (err) {
                    const isNoFallbackError = err instanceof NoFallbackError;
                    if (!isNoFallbackError || isNoFallbackError && bubbleNoFallback) {
                        throw err;
                    }
                }
            }
            if (this.dynamicRoutes) {
                for (const dynamicRoute of this.dynamicRoutes){
                    const params = dynamicRoute.match(pathname);
                    if (!params) {
                        continue;
                    }
                    const dynamicRouteResult = await this.findPageComponents(dynamicRoute.page, query, params);
                    if (dynamicRouteResult) {
                        try {
                            return await this.renderToResponseWithComponents(req, res, dynamicRoute.page, dynamicRouteResult, {
                                ...this.renderOpts,
                                params
                            });
                        } catch (err) {
                            const isNoFallbackError = err instanceof NoFallbackError;
                            if (!isNoFallbackError || isNoFallbackError && bubbleNoFallback) {
                                throw err;
                            }
                        }
                    }
                }
            }
        } catch (err) {
            if (err instanceof NoFallbackError && bubbleNoFallback) {
                throw err;
            }
            if (err instanceof _utils1.DecodeError) {
                res.statusCode = 400;
                return await this.renderErrorToResponse(err, req, res, pathname, query);
            }
            res.statusCode = 500;
            const isWrappedError = err instanceof WrappedBuildError;
            const response = await this.renderErrorToResponse(isWrappedError ? err.innerError : err, req, res, pathname, query);
            if (!isWrappedError) {
                if (this.minimalMode) {
                    throw err;
                }
                this.logError(err);
            }
            return response;
        }
        res.statusCode = 404;
        return this.renderErrorToResponse(null, req, res, pathname, query);
    }
    async renderToHTML(req, res, pathname, query = {
    }) {
        const response = await this.renderToResponse(req, res, pathname, query);
        return response ? response.body : null;
    }
    async renderError(err, req, res, pathname, query = {
    }, setHeaders = true) {
        if (setHeaders) {
            res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
        }
        const response = await this.renderErrorToResponse(err, req, res, pathname, query);
        if (this.minimalMode && res.statusCode === 500) {
            throw err;
        }
        if (response === null) {
            return;
        }
        return this.sendResponse(req, res, response);
    }
    async renderErrorToResponse(_err, req, res, _pathname, query = {
    }) {
        let err = _err;
        if (this.renderOpts.dev && !err && res.statusCode === 500) {
            err = new Error('An undefined error was thrown sometime during render... ' + 'See https://nextjs.org/docs/messages/threw-undefined');
        }
        try {
            let result = null;
            const is404 = res.statusCode === 404;
            let using404Page = false;
            // use static 404 page if available and is 404 response
            if (is404) {
                result = await this.findPageComponents('/404', query);
                using404Page = result !== null;
            }
            let statusPage = `/${res.statusCode}`;
            if (!result && _constants.STATIC_STATUS_PAGES.includes(statusPage)) {
                result = await this.findPageComponents(statusPage, query);
            }
            if (!result) {
                result = await this.findPageComponents('/_error', query);
                statusPage = '/_error';
            }
            if (process.env.NODE_ENV !== 'production' && !using404Page && await this.hasPage('/_error') && !await this.hasPage('/404')) {
                this.customErrorNo404Warn();
            }
            try {
                return await this.renderToResponseWithComponents(req, res, statusPage, result, {
                    ...this.renderOpts,
                    err
                });
            } catch (maybeFallbackError) {
                if (maybeFallbackError instanceof NoFallbackError) {
                    throw new Error('invariant: failed to render error page');
                }
                throw maybeFallbackError;
            }
        } catch (renderToHtmlError) {
            const isWrappedError = renderToHtmlError instanceof WrappedBuildError;
            if (!isWrappedError) {
                this.logError(renderToHtmlError);
            }
            res.statusCode = 500;
            const fallbackComponents = await this.getFallbackErrorComponents();
            if (fallbackComponents) {
                return this.renderToResponseWithComponents(req, res, '/_error', {
                    query,
                    components: fallbackComponents
                }, {
                    ...this.renderOpts,
                    // We render `renderToHtmlError` here because `err` is
                    // already captured in the stacktrace.
                    err: isWrappedError ? renderToHtmlError.innerError : renderToHtmlError
                });
            }
            return {
                type: 'html',
                body: 'Internal Server Error'
            };
        }
    }
    async renderErrorToHTML(err, req, res, pathname, query = {
    }) {
        const response = await this.renderErrorToResponse(err, req, res, pathname, query);
        return response ? response.body : null;
    }
    async getFallbackErrorComponents() {
        // The development server will provide an implementation for this
        return null;
    }
    async render404(req, res, parsedUrl, setHeaders = true) {
        const url = req.url;
        const { pathname , query  } = parsedUrl ? parsedUrl : (0, _url).parse(url, true);
        const { i18n  } = this.nextConfig;
        if (i18n) {
            query.__nextLocale = query.__nextLocale || i18n.defaultLocale;
            query.__nextDefaultLocale = query.__nextDefaultLocale || i18n.defaultLocale;
        }
        res.statusCode = 404;
        return this.renderError(null, req, res, pathname, query, setHeaders);
    }
    async serveStatic(req, res, path, parsedUrl) {
        if (!this.isServeableUrl(path)) {
            return this.render404(req, res, parsedUrl);
        }
        if (!(req.method === 'GET' || req.method === 'HEAD')) {
            res.statusCode = 405;
            res.setHeader('Allow', [
                'GET',
                'HEAD'
            ]);
            return this.renderError(null, req, res, path);
        }
        try {
            await (0, _serveStatic).serveStatic(req, res, path);
        } catch (err) {
            if (err.code === 'ENOENT' || err.statusCode === 404) {
                this.render404(req, res, parsedUrl);
            } else if (err.statusCode === 412) {
                res.statusCode = 412;
                return this.renderError(err, req, res, path);
            } else {
                throw err;
            }
        }
    }
    getFilesystemPaths() {
        if (this._validFilesystemPathSet) {
            return this._validFilesystemPathSet;
        }
        const pathUserFilesStatic = (0, _path).join(this.dir, 'static');
        let userFilesStatic = [];
        if (this.hasStaticDir && _fs.default.existsSync(pathUserFilesStatic)) {
            userFilesStatic = (0, _recursiveReaddirSync).recursiveReadDirSync(pathUserFilesStatic).map((f)=>(0, _path).join('.', 'static', f)
            );
        }
        let userFilesPublic = [];
        if (this.publicDir && _fs.default.existsSync(this.publicDir)) {
            userFilesPublic = (0, _recursiveReaddirSync).recursiveReadDirSync(this.publicDir).map((f)=>(0, _path).join('.', 'public', f)
            );
        }
        let nextFilesStatic = [];
        nextFilesStatic = !this.minimalMode ? (0, _recursiveReaddirSync).recursiveReadDirSync((0, _path).join(this.distDir, 'static')).map((f)=>(0, _path).join('.', (0, _path).relative(this.dir, this.distDir), 'static', f)
        ) : [];
        return this._validFilesystemPathSet = new Set([
            ...nextFilesStatic,
            ...userFilesPublic,
            ...userFilesStatic, 
        ]);
    }
    isServeableUrl(untrustedFileUrl) {
        // This method mimics what the version of `send` we use does:
        // 1. decodeURIComponent:
        //    https://github.com/pillarjs/send/blob/0.17.1/index.js#L989
        //    https://github.com/pillarjs/send/blob/0.17.1/index.js#L518-L522
        // 2. resolve:
        //    https://github.com/pillarjs/send/blob/de073ed3237ade9ff71c61673a34474b30e5d45b/index.js#L561
        let decodedUntrustedFilePath;
        try {
            // (1) Decode the URL so we have the proper file name
            decodedUntrustedFilePath = decodeURIComponent(untrustedFileUrl);
        } catch  {
            return false;
        }
        // (2) Resolve "up paths" to determine real request
        const untrustedFilePath = (0, _path).resolve(decodedUntrustedFilePath);
        // don't allow null bytes anywhere in the file path
        if (untrustedFilePath.indexOf('\x00') !== -1) {
            return false;
        }
        // Check if .next/static, static and public are in the path.
        // If not the path is not available.
        if ((untrustedFilePath.startsWith((0, _path).join(this.distDir, 'static') + _path.sep) || untrustedFilePath.startsWith((0, _path).join(this.dir, 'static') + _path.sep) || untrustedFilePath.startsWith((0, _path).join(this.dir, 'public') + _path.sep)) === false) {
            return false;
        }
        // Check against the real filesystem paths
        const filesystemUrls = this.getFilesystemPaths();
        const resolved = (0, _path).relative(this.dir, untrustedFilePath);
        return filesystemUrls.has(resolved);
    }
    readBuildId() {
        const buildIdFile = (0, _path).join(this.distDir, _constants.BUILD_ID_FILE);
        try {
            return _fs.default.readFileSync(buildIdFile, 'utf8').trim();
        } catch (err) {
            if (!_fs.default.existsSync(buildIdFile)) {
                throw new Error(`Could not find a production build in the '${this.distDir}' directory. Try building your app with 'next build' before starting the production server. https://nextjs.org/docs/messages/production-start-no-build-id`);
            }
            throw err;
        }
    }
    get _isLikeServerless() {
        return (0, _config).isTargetLikeServerless(this.nextConfig.target);
    }
}
exports.default = Server;
function prepareServerlessUrl(req, query) {
    const curUrl = (0, _url).parse(req.url, true);
    req.url = (0, _url).format({
        ...curUrl,
        search: undefined,
        query: {
            ...curUrl.query,
            ...query
        }
    });
}
class NoFallbackError extends Error {
}
class WrappedBuildError extends Error {
    constructor(innerError){
        super();
        this.innerError = innerError;
    }
}
exports.WrappedBuildError = WrappedBuildError;

//# sourceMappingURL=next-server.js.map