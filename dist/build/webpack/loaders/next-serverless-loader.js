"use strict";exports.__esModule=true;exports.default=void 0;var _devalue=_interopRequireDefault(require("next/dist/compiled/devalue"));var _escapeStringRegexp=_interopRequireDefault(require("next/dist/compiled/escape-string-regexp"));var _path=require("path");var _querystring=require("querystring");var _constants=require("../../../lib/constants");var _constants2=require("../../../next-server/lib/constants");var _utils=require("../../../next-server/lib/router/utils");function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}const vercelHeader='x-vercel-id';const nextServerlessLoader=function(){const{distDir,absolutePagePath,page,buildId,canonicalBase,assetPrefix,absoluteAppPath,absoluteDocumentPath,absoluteErrorPath,generateEtags,basePath,runtimeConfig,previewProps}=typeof this.query==='string'?(0,_querystring.parse)(this.query.substr(1)):this.query;const buildManifest=(0,_path.join)(distDir,_constants2.BUILD_MANIFEST).replace(/\\/g,'/');const reactLoadableManifest=(0,_path.join)(distDir,_constants2.REACT_LOADABLE_MANIFEST).replace(/\\/g,'/');const routesManifest=(0,_path.join)(distDir,_constants2.ROUTES_MANIFEST).replace(/\\/g,'/');const escapedBuildId=(0,_escapeStringRegexp.default)(buildId);const pageIsDynamicRoute=(0,_utils.isDynamicRoute)(page);const encodedPreviewProps=(0,_devalue.default)(JSON.parse(previewProps));const collectDynamicRouteParams=pageIsDynamicRoute?`
      function collectDynamicRouteParams(query) {
        return ${JSON.stringify(Object.keys((0,_utils.getRouteRegex)(page).groups))}
          .reduce((prev, key) => {
            prev[key] = query[key]
            return prev
          }, {})
      }
    `:'';const runtimeConfigImports=runtimeConfig?`
      const { setConfig } = require('next/config')
    `:'';const runtimeConfigSetter=runtimeConfig?`
      const runtimeConfig = ${runtimeConfig}
      setConfig(runtimeConfig)
    `:'const runtimeConfig = {}';const dynamicRouteImports=pageIsDynamicRoute?`
    const { getRouteMatcher } = require('next/dist/next-server/lib/router/utils/route-matcher');
      const { getRouteRegex } = require('next/dist/next-server/lib/router/utils/route-regex');
  `:'';const dynamicRouteMatcher=pageIsDynamicRoute?`
    const dynamicRouteMatcher = getRouteMatcher(getRouteRegex("${page}"))
  `:'';const rewriteImports=`
    const { rewrites } = require('${routesManifest}')
    const { pathToRegexp, default: pathMatch } = require('next/dist/next-server/server/lib/path-match')
  `;const handleRewrites=`
    const getCustomRouteMatcher = pathMatch(true)
    const {prepareDestination} = require('next/dist/next-server/server/router')

    function handleRewrites(parsedUrl, isVercel) {
      if (isVercel) {
        return parsedUrl
      }

      for (const rewrite of rewrites) {
        const matcher = getCustomRouteMatcher(rewrite.source)
        const params = matcher(parsedUrl.pathname)

        if (params) {
          const { parsedDestination } = prepareDestination(
            rewrite.destination,
            params,
            parsedUrl.query
          )

          Object.assign(parsedUrl.query, parsedDestination.query, params)
          delete parsedDestination.query

          Object.assign(parsedUrl, parsedDestination)

          if (parsedUrl.pathname === '${page}'){
            break
          }
          ${pageIsDynamicRoute?`
            const dynamicParams = dynamicRouteMatcher(parsedUrl.pathname);\
            if (dynamicParams) {
              parsedUrl.query = {
                ...parsedUrl.query,
                ...dynamicParams
              }
              break
            }
          `:''}
        }
      }

      return parsedUrl
    }
  `;if(page.match(_constants.API_ROUTE)){return`
      import initServer from 'next-plugin-loader?middleware=on-init-server!'
      import onError from 'next-plugin-loader?middleware=on-error-server!'
      import fetch from 'next/dist/compiled/node-fetch'

      if(!global.fetch) {
        global.fetch = fetch
      }
      ${runtimeConfigImports}
      ${/*
          this needs to be called first so its available for any other imports
        */runtimeConfigSetter}
      ${dynamicRouteImports}
      const { parse } = require('url')
      const { apiResolver } = require('next/dist/next-server/server/api-utils')
      ${rewriteImports}

      ${dynamicRouteMatcher}
      ${collectDynamicRouteParams}

      ${handleRewrites}

      export default async (req, res) => {
        try {
          await initServer()

          ${basePath?`
          if(req.url.startsWith('${basePath}')) {
            req.url = req.url.replace('${basePath}', '')
          }
          `:''}
          // We don't need to loop over rewrites to collect the query values
          // on Vercel because the query values are already present
          const isVercel = req.headers['${vercelHeader}']
          const parsedUrl = handleRewrites(parse(req.url, true), isVercel)

          // The dynamic route params are already provided in the query
          // on Vercel
          const params = ${pageIsDynamicRoute?`
              isVercel
                ? collectDynamicRouteParams(parsedUrl.query)
                : dynamicRouteMatcher(parsedUrl.pathname)
              `:`{}`}

          console.log({ params, url: req.url })

          const resolver = require('${absolutePagePath}')
          await apiResolver(
            req,
            res,
            Object.assign({}, parsedUrl.query, params ),
            resolver,
            ${encodedPreviewProps},
            onError
          )
        } catch (err) {
          console.error(err)
          await onError(err)

          if (err.code === 'DECODE_FAILED') {
            res.statusCode = 400
            res.end('Bad Request')
          } else {
            res.statusCode = 500
            res.end('Internal Server Error')
          }
        }
      }
    `;}else{return`
    import initServer from 'next-plugin-loader?middleware=on-init-server!'
    import onError from 'next-plugin-loader?middleware=on-error-server!'
    import fetch from 'next/dist/compiled/node-fetch'

    if(!global.fetch) {
      global.fetch = fetch
    }
    ${runtimeConfigImports}
    ${// this needs to be called first so its available for any other imports
runtimeConfigSetter}
    const {parse} = require('url')
    const {parse: parseQs} = require('querystring')
    const {renderToHTML} = require('next/dist/next-server/server/render');
    const { tryGetPreviewData } = require('next/dist/next-server/server/api-utils');
    const {sendHTML} = require('next/dist/next-server/server/send-html');
    const {sendPayload} = require('next/dist/next-server/server/send-payload');
    const buildManifest = require('${buildManifest}');
    const reactLoadableManifest = require('${reactLoadableManifest}');
    const Document = require('${absoluteDocumentPath}').default;
    const Error = require('${absoluteErrorPath}').default;
    const App = require('${absoluteAppPath}').default;
    ${dynamicRouteImports}
    ${rewriteImports}

    const ComponentInfo = require('${absolutePagePath}')

    const Component = ComponentInfo.default
    export default Component
    export const unstable_getStaticParams = ComponentInfo['unstable_getStaticParam' + 's']
    export const getStaticProps = ComponentInfo['getStaticProp' + 's']
    export const getStaticPaths = ComponentInfo['getStaticPath' + 's']
    export const getServerSideProps = ComponentInfo['getServerSideProp' + 's']

    // kept for detecting legacy exports
    export const unstable_getStaticProps = ComponentInfo['unstable_getStaticProp' + 's']
    export const unstable_getStaticPaths = ComponentInfo['unstable_getStaticPath' + 's']
    export const unstable_getServerProps = ComponentInfo['unstable_getServerProp' + 's']

    ${dynamicRouteMatcher}
    ${collectDynamicRouteParams}
    ${handleRewrites}

    export const config = ComponentInfo['confi' + 'g'] || {}
    export const _app = App
    export async function renderReqToHTML(req, res, renderMode, _renderOpts, _params) {
      const fromExport = renderMode === 'export' || renderMode === true;
      ${basePath?`
      if(req.url.startsWith('${basePath}')) {
        req.url = req.url.replace('${basePath}', '')
      }
      `:''}
      const options = {
        App,
        Document,
        buildManifest,
        getStaticProps,
        getServerSideProps,
        getStaticPaths,
        reactLoadableManifest,
        canonicalBase: "${canonicalBase}",
        buildId: "${buildId}",
        assetPrefix: "${assetPrefix}",
        runtimeConfig: runtimeConfig.publicRuntimeConfig || {},
        previewProps: ${encodedPreviewProps},
        env: process.env,
        basePath: "${basePath}",
        ..._renderOpts
      }
      let _nextData = false
      let parsedUrl

      try {
        // We don't need to loop over rewrites to collect the query values
        // on Vercel because the query values are already present
        const isVercel = req.headers['${vercelHeader}']
        const parsedUrl = handleRewrites(parse(req.url, true), isVercel)

        if (parsedUrl.pathname.match(/_next\\/data/)) {
          _nextData = true
          parsedUrl.pathname = parsedUrl.pathname
            .replace(new RegExp('/_next/data/${escapedBuildId}/'), '/')
            .replace(/\\.json$/, '')
        }

        const renderOpts = Object.assign(
          {
            Component,
            pageConfig: config,
            nextExport: fromExport
          },
          options,
        )

        ${page==='/_error'?`
          if (!res.statusCode) {
            res.statusCode = 404
          }
        `:''}

        ${pageIsDynamicRoute?`
            // The dynamic route params are already provided in the query
            // on Vercel
            const params = (
              fromExport &&
              !getStaticProps &&
              !getServerSideProps
            ) ? {}
              : isVercel
                ? collectDynamicRouteParams(parsedUrl.query)
                : dynamicRouteMatcher(parsedUrl.pathname) || {};
            `:`const params = {};`}
        // make sure to set renderOpts to the correct params e.g. _params
        // if provided from worker or params if we're parsing them here
        renderOpts.params = _params || params

        console.log(JSON.stringify({ query: parsedUrl.query, params, url: req.url, headers: req.headers }))

        const isFallback = parsedUrl.query.__nextFallback

        const previewData = tryGetPreviewData(req, res, options.previewProps)
        const isPreviewMode = previewData !== false

        let result = await renderToHTML(req, res, "${page}", Object.assign({}, getStaticProps ? { ...(parsedUrl.query.amp ? { amp: '1' } : {}) } : parsedUrl.query,  params, _params, isFallback ? { __nextFallback: 'true' } : {}), renderOpts)

        if (!renderMode) {
          if (_nextData || getStaticProps || getServerSideProps) {
            sendPayload(res, _nextData ? JSON.stringify(renderOpts.pageData) : result, _nextData ? 'json' : 'html', {
              private: isPreviewMode,
              stateful: !!getServerSideProps,
              revalidate: renderOpts.revalidate,
            })
            return null
          }
        } else if (isPreviewMode) {
          res.setHeader(
            'Cache-Control',
            'private, no-cache, no-store, max-age=0, must-revalidate'
          )
        }

        if (renderMode) return { html: result, renderOpts }
        return result
      } catch (err) {
        if (!parsedUrl) {
          parsedUrl = parse(req.url, true)
        }

        if (err.code === 'ENOENT') {
          res.statusCode = 404
        } else if (err.code === 'DECODE_FAILED') {
          res.statusCode = 400
        } else {
          console.error(err)
          res.statusCode = 500
        }

        const result = await renderToHTML(req, res, "/_error", parsedUrl.query, Object.assign({}, options, {
          getStaticProps: undefined,
          getStaticPaths: undefined,
          getServerSideProps: undefined,
          Component: Error,
          err: res.statusCode === 404 ? undefined : err
        }))
        return result
      }
    }
    export async function render (req, res) {
      try {
        await initServer()
        const html = await renderReqToHTML(req, res)
        if (html) {
          sendHTML(req, res, html, {generateEtags: ${generateEtags}})
        }
      } catch(err) {
        await onError(err)
        console.error(err)
        res.statusCode = 500
        res.end('Internal Server Error')
      }
    }
  `;}};var _default=nextServerlessLoader;exports.default=_default;