"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = void 0;
var _devalue = _interopRequireDefault(require("next/dist/compiled/devalue"));
var _escapeStringRegexp = _interopRequireDefault(require("next/dist/compiled/escape-string-regexp"));
var _path = require("path");
var _querystring = require("querystring");
var _constants = require("../../../../lib/constants");
var _utils = require("../../../../shared/lib/router/utils");
var _constants1 = require("../../../../shared/lib/constants");
var _trace = require("../../../../telemetry/trace");
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const nextServerlessLoader = function() {
    const loaderSpan = (0, _trace).trace('next-serverless-loader');
    return loaderSpan.traceFn(()=>{
        const { distDir , absolutePagePath , page , buildId , canonicalBase , assetPrefix , absoluteAppPath , absoluteDocumentPath , absoluteErrorPath , absolute404Path , generateEtags , poweredByHeader , basePath , runtimeConfig , previewProps , loadedEnvFiles , i18n ,  } = typeof this.query === 'string' ? (0, _querystring).parse(this.query.substr(1)) : this.query;
        const buildManifest = (0, _path).join(distDir, _constants1.BUILD_MANIFEST).replace(/\\/g, '/');
        const reactLoadableManifest = (0, _path).join(distDir, _constants1.REACT_LOADABLE_MANIFEST).replace(/\\/g, '/');
        const routesManifest = (0, _path).join(distDir, _constants1.ROUTES_MANIFEST).replace(/\\/g, '/');
        const escapedBuildId = (0, _escapeStringRegexp).default(buildId);
        const pageIsDynamicRoute = (0, _utils).isDynamicRoute(page);
        const encodedPreviewProps = (0, _devalue).default(JSON.parse(previewProps));
        const envLoading = `\n      const { processEnv } = require('@next/env')\n      processEnv(${Buffer.from(loadedEnvFiles, 'base64').toString()})\n    `;
        const runtimeConfigImports = runtimeConfig ? `\n        const { setConfig } = require('next/config')\n      ` : '';
        const runtimeConfigSetter = runtimeConfig ? `\n        const runtimeConfig = ${runtimeConfig}\n        setConfig(runtimeConfig)\n      ` : 'const runtimeConfig = {}';
        if (page.match(_constants.API_ROUTE)) {
            return `\n        ${envLoading}\n        ${runtimeConfigImports}\n        ${/*
            this needs to be called first so its available for any other imports
          */ runtimeConfigSetter}\n        import 'next/dist/server/node-polyfill-fetch'\n        import routesManifest from '${routesManifest}'\n\n        import { getApiHandler } from 'next/dist/build/webpack/loaders/next-serverless-loader/api-handler'\n\n        const combinedRewrites = Array.isArray(routesManifest.rewrites)\n          ? routesManifest.rewrites\n          : []\n\n        if (!Array.isArray(routesManifest.rewrites)) {\n          combinedRewrites.push(...routesManifest.rewrites.beforeFiles)\n          combinedRewrites.push(...routesManifest.rewrites.afterFiles)\n          combinedRewrites.push(...routesManifest.rewrites.fallback)\n        }\n\n        const apiHandler = getApiHandler({\n          pageModule: require("${absolutePagePath}"),\n          rewrites: combinedRewrites,\n          i18n: ${i18n || 'undefined'},\n          page: "${page}",\n          basePath: "${basePath}",\n          pageIsDynamic: ${pageIsDynamicRoute},\n          encodedPreviewProps: ${encodedPreviewProps}\n        })\n        export default apiHandler\n      `;
        } else {
            return `\n      import 'next/dist/server/node-polyfill-fetch'\n      import routesManifest from '${routesManifest}'\n      import buildManifest from '${buildManifest}'\n      import reactLoadableManifest from '${reactLoadableManifest}'\n\n      ${envLoading}\n      ${runtimeConfigImports}\n      ${// this needs to be called first so its available for any other imports
            runtimeConfigSetter}\n      import { getPageHandler } from 'next/dist/build/webpack/loaders/next-serverless-loader/page-handler'\n\n      const documentModule = require("${absoluteDocumentPath}")\n\n      const appMod = require('${absoluteAppPath}')\n      let App = appMod.default || appMod.then && appMod.then(mod => mod.default);\n\n      const compMod = require('${absolutePagePath}')\n\n      const Component = compMod.default || compMod.then && compMod.then(mod => mod.default)\n      export default Component\n      export const getStaticProps = compMod['getStaticProp' + 's'] || compMod.then && compMod.then(mod => mod['getStaticProp' + 's'])\n      export const getStaticPaths = compMod['getStaticPath' + 's'] || compMod.then && compMod.then(mod => mod['getStaticPath' + 's'])\n      export const getServerSideProps = compMod['getServerSideProp' + 's'] || compMod.then && compMod.then(mod => mod['getServerSideProp' + 's'])\n\n      // kept for detecting legacy exports\n      export const unstable_getStaticParams = compMod['unstable_getStaticParam' + 's'] || compMod.then && compMod.then(mod => mod['unstable_getStaticParam' + 's'])\n      export const unstable_getStaticProps = compMod['unstable_getStaticProp' + 's'] || compMod.then && compMod.then(mod => mod['unstable_getStaticProp' + 's'])\n      export const unstable_getStaticPaths = compMod['unstable_getStaticPath' + 's'] || compMod.then && compMod.then(mod => mod['unstable_getStaticPath' + 's'])\n      export const unstable_getServerProps = compMod['unstable_getServerProp' + 's'] || compMod.then && compMod.then(mod => mod['unstable_getServerProp' + 's'])\n\n      export let config = compMod['confi' + 'g'] || (compMod.then && compMod.then(mod => mod['confi' + 'g'])) || {}\n      export const _app = App\n\n      const combinedRewrites = Array.isArray(routesManifest.rewrites)\n        ? routesManifest.rewrites\n        : []\n\n      if (!Array.isArray(routesManifest.rewrites)) {\n        combinedRewrites.push(...routesManifest.rewrites.beforeFiles)\n        combinedRewrites.push(...routesManifest.rewrites.afterFiles)\n        combinedRewrites.push(...routesManifest.rewrites.fallback)\n      }\n\n      const { renderReqToHTML, render } = getPageHandler({\n        pageModule: compMod,\n        pageComponent: Component,\n        pageConfig: config,\n        appModule: App,\n        documentModule: documentModule,\n        errorModule: require("${absoluteErrorPath}"),\n        notFoundModule: ${absolute404Path ? `require("${absolute404Path}")` : undefined},\n        pageGetStaticProps: getStaticProps,\n        pageGetStaticPaths: getStaticPaths,\n        pageGetServerSideProps: getServerSideProps,\n\n        assetPrefix: "${assetPrefix}",\n        canonicalBase: "${canonicalBase}",\n        generateEtags: ${generateEtags || 'false'},\n        poweredByHeader: ${poweredByHeader || 'false'},\n\n        runtimeConfig,\n        buildManifest,\n        reactLoadableManifest,\n\n        rewrites: combinedRewrites,\n        i18n: ${i18n || 'undefined'},\n        page: "${page}",\n        buildId: "${buildId}",\n        escapedBuildId: "${escapedBuildId}",\n        basePath: "${basePath}",\n        pageIsDynamic: ${pageIsDynamicRoute},\n        encodedPreviewProps: ${encodedPreviewProps}\n      })\n      export { renderReqToHTML, render }\n    `;
        }
    });
};
var _default = nextServerlessLoader;
exports.default = _default;

//# sourceMappingURL=index.js.map