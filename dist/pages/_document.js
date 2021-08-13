"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DocumentContext", {
    enumerable: true,
    get: function() {
        return _utils.DocumentContext;
    }
});
Object.defineProperty(exports, "DocumentInitialProps", {
    enumerable: true,
    get: function() {
        return _utils.DocumentInitialProps;
    }
});
Object.defineProperty(exports, "DocumentProps", {
    enumerable: true,
    get: function() {
        return _utils.DocumentProps;
    }
});
exports.Html = Html;
exports.Main = Main;
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _server = _interopRequireDefault(require("styled-jsx/server"));
var _constants = require("../shared/lib/constants");
var _utils = require("../shared/lib/utils");
var _getPageFiles = require("../server/get-page-files");
var _utils1 = require("../server/utils");
var _htmlescape = require("../server/htmlescape");
var _script = _interopRequireDefault(require("../client/script"));
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
function getDocumentFiles(buildManifest, pathname, inAmpMode) {
    const sharedFiles = (0, _getPageFiles).getPageFiles(buildManifest, '/_app');
    const pageFiles = inAmpMode ? [] : (0, _getPageFiles).getPageFiles(buildManifest, pathname);
    return {
        sharedFiles,
        pageFiles,
        allFiles: [
            ...new Set([
                ...sharedFiles,
                ...pageFiles
            ])
        ]
    };
}
function getPolyfillScripts(context, props) {
    // polyfills.js has to be rendered as nomodule without async
    // It also has to be the first script to load
    const { assetPrefix , buildManifest , devOnlyCacheBusterQueryString , disableOptimizedLoading ,  } = context;
    return buildManifest.polyfillFiles.filter((polyfill)=>polyfill.endsWith('.js') && !polyfill.endsWith('.module.js')
    ).map((polyfill)=>/*#__PURE__*/ _react.default.createElement("script", {
            key: polyfill,
            defer: !disableOptimizedLoading,
            nonce: props.nonce,
            crossOrigin: props.crossOrigin || process.env.__NEXT_CROSS_ORIGIN,
            noModule: true,
            src: `${assetPrefix}/_next/${polyfill}${devOnlyCacheBusterQueryString}`
        })
    );
}
function getPreNextScripts(context, props) {
    const { scriptLoader , disableOptimizedLoading  } = context;
    return (scriptLoader.beforeInteractive || []).map((file, index)=>{
        const { strategy , ...scriptProps } = file;
        return(/*#__PURE__*/ _react.default.createElement("script", Object.assign({
        }, scriptProps, {
            key: scriptProps.src || index,
            defer: !disableOptimizedLoading,
            nonce: props.nonce,
            crossOrigin: props.crossOrigin || process.env.__NEXT_CROSS_ORIGIN
        })));
    });
}
function getDynamicChunks(context, props, files) {
    const { dynamicImports , assetPrefix , isDevelopment , devOnlyCacheBusterQueryString , disableOptimizedLoading ,  } = context;
    return dynamicImports.map((file)=>{
        if (!file.endsWith('.js') || files.allFiles.includes(file)) return null;
        return(/*#__PURE__*/ _react.default.createElement("script", {
            async: !isDevelopment && disableOptimizedLoading,
            defer: !disableOptimizedLoading,
            key: file,
            src: `${assetPrefix}/_next/${encodeURI(file)}${devOnlyCacheBusterQueryString}`,
            nonce: props.nonce,
            crossOrigin: props.crossOrigin || process.env.__NEXT_CROSS_ORIGIN
        }));
    });
}
function getScripts(context, props, files) {
    var ref;
    const { assetPrefix , buildManifest , isDevelopment , devOnlyCacheBusterQueryString , disableOptimizedLoading ,  } = context;
    const normalScripts = files.allFiles.filter((file)=>file.endsWith('.js')
    );
    const lowPriorityScripts = (ref = buildManifest.lowPriorityFiles) === null || ref === void 0 ? void 0 : ref.filter((file)=>file.endsWith('.js')
    );
    return [
        ...normalScripts,
        ...lowPriorityScripts
    ].map((file)=>{
        return(/*#__PURE__*/ _react.default.createElement("script", {
            key: file,
            src: `${assetPrefix}/_next/${encodeURI(file)}${devOnlyCacheBusterQueryString}`,
            nonce: props.nonce,
            async: !isDevelopment && disableOptimizedLoading,
            defer: !disableOptimizedLoading,
            crossOrigin: props.crossOrigin || process.env.__NEXT_CROSS_ORIGIN
        }));
    });
}
class Document1 extends _react.Component {
    /**
   * `getInitialProps` hook returns the context object with the addition of `renderPage`.
   * `renderPage` callback executes `React` rendering logic synchronously to support server-rendering wrappers
   */ static async getInitialProps(ctx) {
        const enhanceApp = (App)=>{
            return (props)=>/*#__PURE__*/ _react.default.createElement(App, Object.assign({
                }, props))
            ;
        };
        const { html , head  } = await ctx.renderPage({
            enhanceApp
        });
        const styles = [
            ...(0, _server).default()
        ];
        return {
            html,
            head,
            styles
        };
    }
    render() {
        return(/*#__PURE__*/ _react.default.createElement(Html, null, /*#__PURE__*/ _react.default.createElement(Head, null), /*#__PURE__*/ _react.default.createElement("body", null, /*#__PURE__*/ _react.default.createElement(Main, null), /*#__PURE__*/ _react.default.createElement(NextScript, null))));
    }
}
exports.default = Document1;
function Html(props) {
    const { inAmpMode , docComponentsRendered , locale  } = (0, _react).useContext(_utils.HtmlContext);
    docComponentsRendered.Html = true;
    return(/*#__PURE__*/ _react.default.createElement("html", Object.assign({
    }, props, {
        lang: props.lang || locale || undefined,
        amp: inAmpMode ? '' : undefined,
        "data-ampdevmode": inAmpMode && process.env.NODE_ENV !== 'production' ? '' : undefined
    })));
}
class Head extends _react.Component {
    getCssLinks(files) {
        const { assetPrefix , devOnlyCacheBusterQueryString , dynamicImports ,  } = this.context;
        const cssFiles = files.allFiles.filter((f)=>f.endsWith('.css')
        );
        const sharedFiles = new Set(files.sharedFiles);
        // Unmanaged files are CSS files that will be handled directly by the
        // webpack runtime (`mini-css-extract-plugin`).
        let unmangedFiles = new Set([]);
        let dynamicCssFiles = Array.from(new Set(dynamicImports.filter((file)=>file.endsWith('.css')
        )));
        if (dynamicCssFiles.length) {
            const existing = new Set(cssFiles);
            dynamicCssFiles = dynamicCssFiles.filter((f)=>!(existing.has(f) || sharedFiles.has(f))
            );
            unmangedFiles = new Set(dynamicCssFiles);
            cssFiles.push(...dynamicCssFiles);
        }
        let cssLinkElements = [];
        cssFiles.forEach((file)=>{
            const isSharedFile = sharedFiles.has(file);
            if (!process.env.__NEXT_OPTIMIZE_CSS) {
                cssLinkElements.push(/*#__PURE__*/ _react.default.createElement("link", {
                    key: `${file}-preload`,
                    nonce: this.props.nonce,
                    rel: "preload",
                    href: `${assetPrefix}/_next/${encodeURI(file)}${devOnlyCacheBusterQueryString}`,
                    as: "style",
                    crossOrigin: this.props.crossOrigin || process.env.__NEXT_CROSS_ORIGIN
                }));
            }
            const isUnmanagedFile = unmangedFiles.has(file);
            cssLinkElements.push(/*#__PURE__*/ _react.default.createElement("link", {
                key: file,
                nonce: this.props.nonce,
                rel: "stylesheet",
                href: `${assetPrefix}/_next/${encodeURI(file)}${devOnlyCacheBusterQueryString}`,
                crossOrigin: this.props.crossOrigin || process.env.__NEXT_CROSS_ORIGIN,
                "data-n-g": isUnmanagedFile ? undefined : isSharedFile ? '' : undefined,
                "data-n-p": isUnmanagedFile ? undefined : isSharedFile ? undefined : ''
            }));
        });
        if (process.env.NODE_ENV !== 'development' && process.env.__NEXT_OPTIMIZE_FONTS) {
            cssLinkElements = this.makeStylesheetInert(cssLinkElements);
        }
        return cssLinkElements.length === 0 ? null : cssLinkElements;
    }
    getPreloadDynamicChunks() {
        const { dynamicImports , assetPrefix , devOnlyCacheBusterQueryString ,  } = this.context;
        return dynamicImports.map((file)=>{
            if (!file.endsWith('.js')) {
                return null;
            }
            return(/*#__PURE__*/ _react.default.createElement("link", {
                rel: "preload",
                key: file,
                href: `${assetPrefix}/_next/${encodeURI(file)}${devOnlyCacheBusterQueryString}`,
                as: "script",
                nonce: this.props.nonce,
                crossOrigin: this.props.crossOrigin || process.env.__NEXT_CROSS_ORIGIN
            }));
        })// Filter out nulled scripts
        .filter(Boolean);
    }
    getPreloadMainLinks(files) {
        const { assetPrefix , devOnlyCacheBusterQueryString , scriptLoader ,  } = this.context;
        const preloadFiles = files.allFiles.filter((file)=>{
            return file.endsWith('.js');
        });
        return [
            ...(scriptLoader.beforeInteractive || []).map((file)=>/*#__PURE__*/ _react.default.createElement("link", {
                    key: file.src,
                    nonce: this.props.nonce,
                    rel: "preload",
                    href: file.src,
                    as: "script",
                    crossOrigin: this.props.crossOrigin || process.env.__NEXT_CROSS_ORIGIN
                })
            ),
            ...preloadFiles.map((file)=>/*#__PURE__*/ _react.default.createElement("link", {
                    key: file,
                    nonce: this.props.nonce,
                    rel: "preload",
                    href: `${assetPrefix}/_next/${encodeURI(file)}${devOnlyCacheBusterQueryString}`,
                    as: "script",
                    crossOrigin: this.props.crossOrigin || process.env.__NEXT_CROSS_ORIGIN
                })
            ), 
        ];
    }
    getDynamicChunks(files) {
        return getDynamicChunks(this.context, this.props, files);
    }
    getPreNextScripts() {
        return getPreNextScripts(this.context, this.props);
    }
    getScripts(files) {
        return getScripts(this.context, this.props, files);
    }
    getPolyfillScripts() {
        return getPolyfillScripts(this.context, this.props);
    }
    handleDocumentScriptLoaderItems(children) {
        const { scriptLoader  } = this.context;
        const scriptLoaderItems = [];
        const filteredChildren = [];
        _react.default.Children.forEach(children, (child)=>{
            if (child.type === _script.default) {
                if (child.props.strategy === 'beforeInteractive') {
                    scriptLoader.beforeInteractive = (scriptLoader.beforeInteractive || []).concat([
                        {
                            ...child.props
                        }, 
                    ]);
                    return;
                } else if ([
                    'lazyOnload',
                    'afterInteractive'
                ].includes(child.props.strategy)) {
                    scriptLoaderItems.push(child.props);
                    return;
                }
            }
            filteredChildren.push(child);
        });
        this.context.__NEXT_DATA__.scriptLoader = scriptLoaderItems;
        return filteredChildren;
    }
    makeStylesheetInert(node) {
        return _react.default.Children.map(node, (c)=>{
            if (c.type === 'link' && c.props['href'] && _constants.OPTIMIZED_FONT_PROVIDERS.some(({ url  })=>c.props['href'].startsWith(url)
            )) {
                const newProps = {
                    ...c.props || {
                    }
                };
                newProps['data-href'] = newProps['href'];
                newProps['href'] = undefined;
                return(/*#__PURE__*/ _react.default.cloneElement(c, newProps));
            } else if (c.props && c.props['children']) {
                c.props['children'] = this.makeStylesheetInert(c.props['children']);
            }
            return c;
        });
    }
    render() {
        const { styles , ampPath , inAmpMode , hybridAmp , canonicalBase , __NEXT_DATA__ , dangerousAsPath , headTags , unstable_runtimeJS , unstable_JsPreload , disableOptimizedLoading ,  } = this.context;
        const disableRuntimeJS = unstable_runtimeJS === false;
        const disableJsPreload = unstable_JsPreload === false || !disableOptimizedLoading;
        this.context.docComponentsRendered.Head = true;
        let { head  } = this.context;
        let cssPreloads = [];
        let otherHeadElements = [];
        if (head) {
            head.forEach((c)=>{
                if (c && c.type === 'link' && c.props['rel'] === 'preload' && c.props['as'] === 'style') {
                    cssPreloads.push(c);
                } else {
                    c && otherHeadElements.push(c);
                }
            });
            head = cssPreloads.concat(otherHeadElements);
        }
        let children = _react.default.Children.toArray(this.props.children).filter(Boolean);
        // show a warning if Head contains <title> (only in development)
        if (process.env.NODE_ENV !== 'production') {
            children = _react.default.Children.map(children, (child)=>{
                var ref;
                const isReactHelmet = child === null || child === void 0 ? void 0 : (ref = child.props) === null || ref === void 0 ? void 0 : ref['data-react-helmet'];
                if (!isReactHelmet) {
                    var ref1;
                    if ((child === null || child === void 0 ? void 0 : child.type) === 'title') {
                        console.warn("Warning: <title> should not be used in _document.js's <Head>. https://nextjs.org/docs/messages/no-document-title");
                    } else if ((child === null || child === void 0 ? void 0 : child.type) === 'meta' && (child === null || child === void 0 ? void 0 : (ref1 = child.props) === null || ref1 === void 0 ? void 0 : ref1.name) === 'viewport') {
                        console.warn("Warning: viewport meta tags should not be used in _document.js's <Head>. https://nextjs.org/docs/messages/no-document-viewport-meta");
                    }
                }
                return child;
            });
            if (this.props.crossOrigin) console.warn('Warning: `Head` attribute `crossOrigin` is deprecated. https://nextjs.org/docs/messages/doc-crossorigin-deprecated');
        }
        if (process.env.NODE_ENV !== 'development' && process.env.__NEXT_OPTIMIZE_FONTS && !inAmpMode) {
            children = this.makeStylesheetInert(children);
        }
        children = this.handleDocumentScriptLoaderItems(children);
        let hasAmphtmlRel = false;
        let hasCanonicalRel = false;
        // show warning and remove conflicting amp head tags
        head = _react.default.Children.map(head || [], (child)=>{
            if (!child) return child;
            const { type , props  } = child;
            if (inAmpMode) {
                let badProp = '';
                if (type === 'meta' && props.name === 'viewport') {
                    badProp = 'name="viewport"';
                } else if (type === 'link' && props.rel === 'canonical') {
                    hasCanonicalRel = true;
                } else if (type === 'script') {
                    // only block if
                    // 1. it has a src and isn't pointing to ampproject's CDN
                    // 2. it is using dangerouslySetInnerHTML without a type or
                    // a type of text/javascript
                    if (props.src && props.src.indexOf('ampproject') < -1 || props.dangerouslySetInnerHTML && (!props.type || props.type === 'text/javascript')) {
                        badProp = '<script';
                        Object.keys(props).forEach((prop)=>{
                            badProp += ` ${prop}="${props[prop]}"`;
                        });
                        badProp += '/>';
                    }
                }
                if (badProp) {
                    console.warn(`Found conflicting amp tag "${child.type}" with conflicting prop ${badProp} in ${__NEXT_DATA__.page}. https://nextjs.org/docs/messages/conflicting-amp-tag`);
                    return null;
                }
            } else {
                // non-amp mode
                if (type === 'link' && props.rel === 'amphtml') {
                    hasAmphtmlRel = true;
                }
            }
            return child;
        });
        // try to parse styles from fragment for backwards compat
        const curStyles = Array.isArray(styles) ? styles : [];
        if (inAmpMode && styles && // @ts-ignore Property 'props' does not exist on type ReactElement
        styles.props && // @ts-ignore Property 'props' does not exist on type ReactElement
        Array.isArray(styles.props.children)) {
            const hasStyles = (el)=>{
                var ref2, ref3;
                return el === null || el === void 0 ? void 0 : (ref2 = el.props) === null || ref2 === void 0 ? void 0 : (ref3 = ref2.dangerouslySetInnerHTML) === null || ref3 === void 0 ? void 0 : ref3.__html;
            };
            // @ts-ignore Property 'props' does not exist on type ReactElement
            styles.props.children.forEach((child)=>{
                if (Array.isArray(child)) {
                    child.forEach((el)=>hasStyles(el) && curStyles.push(el)
                    );
                } else if (hasStyles(child)) {
                    curStyles.push(child);
                }
            });
        }
        const files = getDocumentFiles(this.context.buildManifest, this.context.__NEXT_DATA__.page, inAmpMode);
        var _nonce, _nonce1;
        return(/*#__PURE__*/ _react.default.createElement("head", Object.assign({
        }, this.props), this.context.isDevelopment && /*#__PURE__*/ _react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/ _react.default.createElement("style", {
            "data-next-hide-fouc": true,
            "data-ampdevmode": inAmpMode ? 'true' : undefined,
            dangerouslySetInnerHTML: {
                __html: `body{display:none}`
            }
        }), /*#__PURE__*/ _react.default.createElement("noscript", {
            "data-next-hide-fouc": true,
            "data-ampdevmode": inAmpMode ? 'true' : undefined
        }, /*#__PURE__*/ _react.default.createElement("style", {
            dangerouslySetInnerHTML: {
                __html: `body{display:block}`
            }
        }))), children, process.env.__NEXT_OPTIMIZE_FONTS && /*#__PURE__*/ _react.default.createElement("meta", {
            name: "next-font-preconnect"
        }), head, /*#__PURE__*/ _react.default.createElement("meta", {
            name: "next-head-count",
            content: _react.default.Children.count(head || []).toString()
        }), inAmpMode && /*#__PURE__*/ _react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/ _react.default.createElement("meta", {
            name: "viewport",
            content: "width=device-width,minimum-scale=1,initial-scale=1"
        }), !hasCanonicalRel && /*#__PURE__*/ _react.default.createElement("link", {
            rel: "canonical",
            href: canonicalBase + (0, _utils1).cleanAmpPath(dangerousAsPath)
        }), /*#__PURE__*/ _react.default.createElement("link", {
            rel: "preload",
            as: "script",
            href: "https://cdn.ampproject.org/v0.js"
        }), styles && /*#__PURE__*/ _react.default.createElement("style", {
            "amp-custom": "",
            dangerouslySetInnerHTML: {
                __html: curStyles.map((style)=>style.props.dangerouslySetInnerHTML.__html
                ).join('').replace(/\/\*# sourceMappingURL=.*\*\//g, '').replace(/\/\*@ sourceURL=.*?\*\//g, '')
            }
        }), /*#__PURE__*/ _react.default.createElement("style", {
            "amp-boilerplate": "",
            dangerouslySetInnerHTML: {
                __html: `body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`
            }
        }), /*#__PURE__*/ _react.default.createElement("noscript", null, /*#__PURE__*/ _react.default.createElement("style", {
            "amp-boilerplate": "",
            dangerouslySetInnerHTML: {
                __html: `body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}`
            }
        })), /*#__PURE__*/ _react.default.createElement("script", {
            async: true,
            src: "https://cdn.ampproject.org/v0.js"
        })), !inAmpMode && /*#__PURE__*/ _react.default.createElement(_react.default.Fragment, null, !hasAmphtmlRel && hybridAmp && /*#__PURE__*/ _react.default.createElement("link", {
            rel: "amphtml",
            href: canonicalBase + getAmpPath(ampPath, dangerousAsPath)
        }), !process.env.__NEXT_OPTIMIZE_CSS && this.getCssLinks(files), !process.env.__NEXT_OPTIMIZE_CSS && /*#__PURE__*/ _react.default.createElement("noscript", {
            "data-n-css": (_nonce = this.props.nonce) !== null && _nonce !== void 0 ? _nonce : ''
        }), process.env.__NEXT_OPTIMIZE_IMAGES && /*#__PURE__*/ _react.default.createElement("meta", {
            name: "next-image-preload"
        }), !disableRuntimeJS && !disableJsPreload && this.getPreloadDynamicChunks(), !disableRuntimeJS && !disableJsPreload && this.getPreloadMainLinks(files), !disableOptimizedLoading && !disableRuntimeJS && this.getPolyfillScripts(), !disableOptimizedLoading && !disableRuntimeJS && this.getPreNextScripts(), !disableOptimizedLoading && !disableRuntimeJS && this.getDynamicChunks(files), !disableOptimizedLoading && !disableRuntimeJS && this.getScripts(files), process.env.__NEXT_OPTIMIZE_CSS && this.getCssLinks(files), process.env.__NEXT_OPTIMIZE_CSS && /*#__PURE__*/ _react.default.createElement("noscript", {
            "data-n-css": (_nonce1 = this.props.nonce) !== null && _nonce1 !== void 0 ? _nonce1 : ''
        }), this.context.isDevelopment && // this element is used to mount development styles so the
        // ordering matches production
        // (by default, style-loader injects at the bottom of <head />)
        /*#__PURE__*/ _react.default.createElement("noscript", {
            id: "__next_css__DO_NOT_USE__"
        }), styles || null), /*#__PURE__*/ _react.default.createElement(_react.default.Fragment, {
        }, ...headTags || [])));
    }
}
exports.Head = Head;
Head.contextType = _utils.HtmlContext;
function Main() {
    const { inAmpMode , docComponentsRendered  } = (0, _react).useContext(_utils.HtmlContext);
    docComponentsRendered.Main = true;
    if (inAmpMode) return(/*#__PURE__*/ _react.default.createElement(_react.default.Fragment, null, _constants.BODY_RENDER_TARGET));
    return(/*#__PURE__*/ _react.default.createElement("div", {
        id: "__next"
    }, _constants.BODY_RENDER_TARGET));
}
class NextScript extends _react.Component {
    getDynamicChunks(files) {
        return getDynamicChunks(this.context, this.props, files);
    }
    getPreNextScripts() {
        return getPreNextScripts(this.context, this.props);
    }
    getScripts(files) {
        return getScripts(this.context, this.props, files);
    }
    getPolyfillScripts() {
        return getPolyfillScripts(this.context, this.props);
    }
    static getInlineScriptSource(context) {
        const { __NEXT_DATA__  } = context;
        try {
            const data = JSON.stringify(__NEXT_DATA__);
            return (0, _htmlescape).htmlEscapeJsonString(data);
        } catch (err) {
            if (err.message.indexOf('circular structure')) {
                throw new Error(`Circular structure in "getInitialProps" result of page "${__NEXT_DATA__.page}". https://nextjs.org/docs/messages/circular-structure`);
            }
            throw err;
        }
    }
    render() {
        const { assetPrefix , inAmpMode , buildManifest , unstable_runtimeJS , docComponentsRendered , devOnlyCacheBusterQueryString , disableOptimizedLoading ,  } = this.context;
        const disableRuntimeJS = unstable_runtimeJS === false;
        docComponentsRendered.NextScript = true;
        if (inAmpMode) {
            if (process.env.NODE_ENV === 'production') {
                return null;
            }
            const ampDevFiles = [
                ...buildManifest.devFiles,
                ...buildManifest.polyfillFiles,
                ...buildManifest.ampDevFiles, 
            ];
            return(/*#__PURE__*/ _react.default.createElement(_react.default.Fragment, null, disableRuntimeJS ? null : /*#__PURE__*/ _react.default.createElement("script", {
                id: "__NEXT_DATA__",
                type: "application/json",
                nonce: this.props.nonce,
                crossOrigin: this.props.crossOrigin || process.env.__NEXT_CROSS_ORIGIN,
                dangerouslySetInnerHTML: {
                    __html: NextScript.getInlineScriptSource(this.context)
                },
                "data-ampdevmode": true
            }), ampDevFiles.map((file)=>/*#__PURE__*/ _react.default.createElement("script", {
                    key: file,
                    src: `${assetPrefix}/_next/${file}${devOnlyCacheBusterQueryString}`,
                    nonce: this.props.nonce,
                    crossOrigin: this.props.crossOrigin || process.env.__NEXT_CROSS_ORIGIN,
                    "data-ampdevmode": true
                })
            )));
        }
        if (process.env.NODE_ENV !== 'production') {
            if (this.props.crossOrigin) console.warn('Warning: `NextScript` attribute `crossOrigin` is deprecated. https://nextjs.org/docs/messages/doc-crossorigin-deprecated');
        }
        const files = getDocumentFiles(this.context.buildManifest, this.context.__NEXT_DATA__.page, inAmpMode);
        return(/*#__PURE__*/ _react.default.createElement(_react.default.Fragment, null, !disableRuntimeJS && buildManifest.devFiles ? buildManifest.devFiles.map((file)=>/*#__PURE__*/ _react.default.createElement("script", {
                key: file,
                src: `${assetPrefix}/_next/${encodeURI(file)}${devOnlyCacheBusterQueryString}`,
                nonce: this.props.nonce,
                crossOrigin: this.props.crossOrigin || process.env.__NEXT_CROSS_ORIGIN
            })
        ) : null, disableRuntimeJS ? null : /*#__PURE__*/ _react.default.createElement("script", {
            id: "__NEXT_DATA__",
            type: "application/json",
            nonce: this.props.nonce,
            crossOrigin: this.props.crossOrigin || process.env.__NEXT_CROSS_ORIGIN,
            dangerouslySetInnerHTML: {
                __html: NextScript.getInlineScriptSource(this.context)
            }
        }), disableOptimizedLoading && !disableRuntimeJS && this.getPolyfillScripts(), disableOptimizedLoading && !disableRuntimeJS && this.getPreNextScripts(), disableOptimizedLoading && !disableRuntimeJS && this.getDynamicChunks(files), disableOptimizedLoading && !disableRuntimeJS && this.getScripts(files)));
    }
}
exports.NextScript = NextScript;
NextScript.contextType = _utils.HtmlContext;
NextScript.safariNomoduleFix = '!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();';
function getAmpPath(ampPath, asPath) {
    return ampPath || `${asPath}${asPath.includes('?') ? '&' : '?'}amp=1`;
}

//# sourceMappingURL=_document.js.map