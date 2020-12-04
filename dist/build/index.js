"use strict";exports.__esModule=true;exports.default=build;var _crypto=_interopRequireDefault(require("crypto"));var _fs=require("fs");var _jestWorker=_interopRequireDefault(require("jest-worker"));var _chalk=_interopRequireDefault(require("chalk"));var _devalue=_interopRequireDefault(require("next/dist/compiled/devalue"));var _escapeStringRegexp=_interopRequireDefault(require("next/dist/compiled/escape-string-regexp"));var _findUp=_interopRequireDefault(require("next/dist/compiled/find-up"));var _index=_interopRequireDefault(require("next/dist/compiled/nanoid/index.js"));var _pathToRegexp=require("next/dist/compiled/path-to-regexp");var _path=_interopRequireDefault(require("path"));var _formatWebpackMessages=_interopRequireDefault(require("../client/dev/error-overlay/format-webpack-messages"));var _constants=require("../lib/constants");var _fileExists=require("../lib/file-exists");var _findPagesDir=require("../lib/find-pages-dir");var _loadCustomRoutes=_interopRequireWildcard(require("../lib/load-custom-routes"));var _env=require("@next/env");var _recursiveDelete=require("../lib/recursive-delete");var _verifyTypeScriptSetup=require("../lib/verifyTypeScriptSetup");var _constants2=require("../next-server/lib/constants");var _utils=require("../next-server/lib/router/utils");var _config=_interopRequireWildcard(require("../next-server/server/config"));require("../next-server/server/node-polyfill-fetch");var _normalizePagePath=require("../next-server/server/normalize-page-path");var _require=require("../next-server/server/require");var ciEnvironment=_interopRequireWildcard(require("../telemetry/ci-info"));var _events=require("../telemetry/events");var _storage=require("../telemetry/storage");var _compiler=require("./compiler");var _entries=require("./entries");var _generateBuildId=require("./generate-build-id");var _isWriteable=require("./is-writeable");var _spinner=_interopRequireDefault(require("./spinner"));var _utils2=require("./utils");var _webpackConfig=_interopRequireDefault(require("./webpack-config"));var _writeBuildId=require("./write-build-id");var Log=_interopRequireWildcard(require("./output/log"));function _getRequireWildcardCache(){if(typeof WeakMap!=="function")return null;var cache=new WeakMap();_getRequireWildcardCache=function(){return cache;};return cache;}function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj;}if(obj===null||typeof obj!=="object"&&typeof obj!=="function"){return{default:obj};}var cache=_getRequireWildcardCache();if(cache&&cache.has(obj)){return cache.get(obj);}var newObj={};var hasPropertyDescriptor=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key)){var desc=hasPropertyDescriptor?Object.getOwnPropertyDescriptor(obj,key):null;if(desc&&(desc.get||desc.set)){Object.defineProperty(newObj,key,desc);}else{newObj[key]=obj[key];}}}newObj.default=obj;if(cache){cache.set(obj,newObj);}return newObj;}function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _wrapRegExp(re,groups){_wrapRegExp=function(re,groups){return new BabelRegExp(re,undefined,groups);};var _RegExp=_wrapNativeSuper(RegExp);var _super=RegExp.prototype;var _groups=new WeakMap();function BabelRegExp(re,flags,groups){var _this=_RegExp.call(this,re,flags);_groups.set(_this,groups||_groups.get(re));return _this;}_inherits(BabelRegExp,_RegExp);BabelRegExp.prototype.exec=function(str){var result=_super.exec.call(this,str);if(result)result.groups=buildGroups(result,this);return result;};BabelRegExp.prototype[Symbol.replace]=function(str,substitution){if(typeof substitution==="string"){var groups=_groups.get(this);return _super[Symbol.replace].call(this,str,substitution.replace(/\$<([^>]+)>/g,function(_,name){return"$"+groups[name];}));}else if(typeof substitution==="function"){var _this=this;return _super[Symbol.replace].call(this,str,function(){var args=[];args.push.apply(args,arguments);if(typeof args[args.length-1]!=="object"){args.push(buildGroups(args,_this));}return substitution.apply(this,args);});}else{return _super[Symbol.replace].call(this,str,substitution);}};function buildGroups(result,re){var g=_groups.get(re);return Object.keys(g).reduce(function(groups,name){groups[name]=result[g[name]];return groups;},Object.create(null));}return _wrapRegExp.apply(this,arguments);}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function");}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,writable:true,configurable:true}});if(superClass)_setPrototypeOf(subClass,superClass);}function _possibleConstructorReturn(self,call){if(call&&(typeof call==="object"||typeof call==="function")){return call;}return _assertThisInitialized(self);}function _assertThisInitialized(self){if(self===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return self;}function _wrapNativeSuper(Class){var _cache=typeof Map==="function"?new Map():undefined;_wrapNativeSuper=function _wrapNativeSuper(Class){if(Class===null||!_isNativeFunction(Class))return Class;if(typeof Class!=="function"){throw new TypeError("Super expression must either be null or a function");}if(typeof _cache!=="undefined"){if(_cache.has(Class))return _cache.get(Class);_cache.set(Class,Wrapper);}function Wrapper(){return _construct(Class,arguments,_getPrototypeOf(this).constructor);}Wrapper.prototype=Object.create(Class.prototype,{constructor:{value:Wrapper,enumerable:false,writable:true,configurable:true}});return _setPrototypeOf(Wrapper,Class);};return _wrapNativeSuper(Class);}function _construct(Parent,args,Class){if(_isNativeReflectConstruct()){_construct=Reflect.construct;}else{_construct=function _construct(Parent,args,Class){var a=[null];a.push.apply(a,args);var Constructor=Function.bind.apply(Parent,a);var instance=new Constructor();if(Class)_setPrototypeOf(instance,Class.prototype);return instance;};}return _construct.apply(null,arguments);}function _isNativeReflectConstruct(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Date.prototype.toString.call(Reflect.construct(Date,[],function(){}));return true;}catch(e){return false;}}function _isNativeFunction(fn){return Function.toString.call(fn).indexOf("[native code]")!==-1;}function _setPrototypeOf(o,p){_setPrototypeOf=Object.setPrototypeOf||function _setPrototypeOf(o,p){o.__proto__=p;return o;};return _setPrototypeOf(o,p);}function _getPrototypeOf(o){_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf:function _getPrototypeOf(o){return o.__proto__||Object.getPrototypeOf(o);};return _getPrototypeOf(o);}const staticCheckWorker=require.resolve('./utils');async function build(dir,conf=null,reactProductionProfiling=false,debugOutput=false){var _config$typescript,_namedExports$include,_namedExports;if(!(await(0,_isWriteable.isWriteable)(dir))){throw new Error('> Build directory is not writeable. https://err.sh/vercel/next.js/build-dir-not-writeable');}// attempt to load global env values so they are available in next.config.js
const{loadedEnvFiles}=(0,_env.loadEnvConfig)(dir,false,Log);const config=(0,_config.default)(_constants2.PHASE_PRODUCTION_BUILD,dir,conf);const{target}=config;const buildId=await(0,_generateBuildId.generateBuildId)(config.generateBuildId,_index.default);const distDir=_path.default.join(dir,config.distDir);const{headers,rewrites,redirects}=await(0,_loadCustomRoutes.default)(config);if(ciEnvironment.isCI&&!ciEnvironment.hasNextSupport){const cacheDir=_path.default.join(distDir,'cache');const hasCache=await(0,_fileExists.fileExists)(cacheDir);if(!hasCache){// Intentionally not piping to stderr in case people fail in CI when
// stderr is detected.
console.log(`${Log.prefixes.warn} No build cache found. Please configure build caching for faster rebuilds. Read more: https://err.sh/next.js/no-cache`);}}const buildSpinner=(0,_spinner.default)({prefixText:`${Log.prefixes.info} Creating an optimized production build`});const telemetry=new _storage.Telemetry({distDir});const publicDir=_path.default.join(dir,'public');const pagesDir=(0,_findPagesDir.findPagesDir)(dir);const hasPublicDir=await(0,_fileExists.fileExists)(publicDir);telemetry.record((0,_events.eventCliSession)(_constants2.PHASE_PRODUCTION_BUILD,dir,{cliCommand:'build',isSrcDir:_path.default.relative(dir,pagesDir).startsWith('src'),hasNowJson:!!(await(0,_findUp.default)('now.json',{cwd:dir})),isCustomServer:null}));(0,_events.eventNextPlugins)(_path.default.resolve(dir)).then(events=>telemetry.record(events));const ignoreTypeScriptErrors=Boolean((_config$typescript=config.typescript)==null?void 0:_config$typescript.ignoreBuildErrors);await(0,_verifyTypeScriptSetup.verifyTypeScriptSetup)(dir,pagesDir,!ignoreTypeScriptErrors);let tracer=null;if(config.experimental.profiling){const{createTrace}=require('./profiler/profiler.js');tracer=createTrace(_path.default.join(distDir,`profile-events.json`));tracer.profiler.startProfiling();}const isLikeServerless=(0,_config.isTargetLikeServerless)(target);const pagePaths=await(0,_utils2.collectPages)(pagesDir,config.pageExtensions);// needed for static exporting since we want to replace with HTML
// files
const allStaticPages=new Set();let allPageInfos=new Map();const previewProps={previewModeId:_crypto.default.randomBytes(16).toString('hex'),previewModeSigningKey:_crypto.default.randomBytes(32).toString('hex'),previewModeEncryptionKey:_crypto.default.randomBytes(32).toString('hex')};const mappedPages=(0,_entries.createPagesMapping)(pagePaths,config.pageExtensions);const entrypoints=(0,_entries.createEntrypoints)(mappedPages,target,buildId,previewProps,config,loadedEnvFiles);const pageKeys=Object.keys(mappedPages);const conflictingPublicFiles=[];const hasCustomErrorPage=mappedPages['/_error'].startsWith('private-next-pages');const hasPages404=Boolean(mappedPages['/404']&&mappedPages['/404'].startsWith('private-next-pages'));let hasNonStaticErrorPage;if(hasPublicDir){const hasPublicUnderScoreNextDir=await(0,_fileExists.fileExists)(_path.default.join(publicDir,'_next'));if(hasPublicUnderScoreNextDir){throw new Error(_constants.PUBLIC_DIR_MIDDLEWARE_CONFLICT);}}// Check if pages conflict with files in `public`
// Only a page of public file can be served, not both.
for(const page in mappedPages){const hasPublicPageFile=await(0,_fileExists.fileExists)(_path.default.join(publicDir,page==='/'?'/index':page),'file');if(hasPublicPageFile){conflictingPublicFiles.push(page);}}const numConflicting=conflictingPublicFiles.length;if(numConflicting){throw new Error(`Conflicting public and page file${numConflicting===1?' was':'s were'} found. https://err.sh/vercel/next.js/conflicting-public-file-page\n${conflictingPublicFiles.join('\n')}`);}const nestedReservedPages=pageKeys.filter(page=>{return page.match(/\/(_app|_document|_error)$/)&&_path.default.dirname(page)!=='/';});if(nestedReservedPages.length){Log.warn(`The following reserved Next.js pages were detected not directly under the pages directory:\n`+nestedReservedPages.join('\n')+`\nSee more info here: https://err.sh/next.js/nested-reserved-page\n`);}const buildCustomRoute=(r,type)=>{const keys=[];if(r.basePath!==false&&(!config.i18n||r.locale===false)){r.source=`${config.basePath}${r.source}`;if(r.destination&&r.destination.startsWith('/')){r.destination=`${config.basePath}${r.destination}`;}}if(config.i18n&&r.locale!==false){var _r$destination;const basePath=r.basePath!==false?config.basePath||'':'';r.source=`${basePath}/:nextInternalLocale(${config.i18n.locales.map(locale=>(0,_escapeStringRegexp.default)(locale)).join('|')})${r.source}`;if(r.destination&&((_r$destination=r.destination)==null?void 0:_r$destination.startsWith('/'))){r.destination=`${basePath}/:nextInternalLocale${r.destination}`;}}const routeRegex=(0,_pathToRegexp.pathToRegexp)(r.source,keys,{strict:true,sensitive:false,delimiter:'/'// default is `/#?`, but Next does not pass query info
});return{...r,...(type==='redirect'?{statusCode:(0,_loadCustomRoutes.getRedirectStatus)(r),permanent:undefined}:{}),regex:(0,_loadCustomRoutes.normalizeRouteRegex)(routeRegex.source)};};const routesManifestPath=_path.default.join(distDir,_constants2.ROUTES_MANIFEST);const routesManifest={version:3,pages404:true,basePath:config.basePath,redirects:redirects.map(r=>buildCustomRoute(r,'redirect')),rewrites:rewrites.map(r=>buildCustomRoute(r,'rewrite')),headers:headers.map(r=>buildCustomRoute(r,'header')),dynamicRoutes:(0,_utils.getSortedRoutes)(pageKeys).filter(_utils.isDynamicRoute).map(page=>{const routeRegex=(0,_utils.getRouteRegex)(page);return{page,regex:(0,_loadCustomRoutes.normalizeRouteRegex)(routeRegex.re.source),routeKeys:routeRegex.routeKeys,namedRegex:routeRegex.namedRegex};}),dataRoutes:[],i18n:config.i18n||undefined};await _fs.promises.mkdir(distDir,{recursive:true});// We need to write the manifest with rewrites before build
// so serverless can import the manifest
await _fs.promises.writeFile(routesManifestPath,JSON.stringify(routesManifest),'utf8');const requiredServerFiles={version:1,config:{...config,compress:false},files:[...[_constants2.ROUTES_MANIFEST,_constants2.PAGES_MANIFEST,_constants2.BUILD_MANIFEST,_constants2.PRERENDER_MANIFEST,_constants2.REACT_LOADABLE_MANIFEST,_constants2.FONT_MANIFEST,_constants2.BUILD_ID_FILE].map(file=>_path.default.join(config.distDir,file))],ignore:[_path.default.relative(dir,_path.default.join(_path.default.dirname(require.resolve('sharp')),'**/*'))]};const configs=await Promise.all([(0,_webpackConfig.default)(dir,{tracer,buildId,reactProductionProfiling,isServer:false,config,target,pagesDir,entrypoints:entrypoints.client,rewrites}),(0,_webpackConfig.default)(dir,{tracer,buildId,reactProductionProfiling,isServer:true,config,target,pagesDir,entrypoints:entrypoints.server,rewrites})]);const clientConfig=configs[0];if(clientConfig.optimization&&(clientConfig.optimization.minimize!==true||clientConfig.optimization.minimizer&&clientConfig.optimization.minimizer.length===0)){Log.warn(`Production code optimization has been disabled in your project. Read more: https://err.sh/vercel/next.js/minification-disabled`);}const webpackBuildStart=process.hrtime();let result={warnings:[],errors:[]};// TODO: why do we need this?? https://github.com/vercel/next.js/issues/8253
if(isLikeServerless){const clientResult=await(0,_compiler.runCompiler)(clientConfig);// Fail build if clientResult contains errors
if(clientResult.errors.length>0){result={warnings:[...clientResult.warnings],errors:[...clientResult.errors]};}else{const serverResult=await(0,_compiler.runCompiler)(configs[1]);result={warnings:[...clientResult.warnings,...serverResult.warnings],errors:[...clientResult.errors,...serverResult.errors]};}}else{result=await(0,_compiler.runCompiler)(configs);}const webpackBuildEnd=process.hrtime(webpackBuildStart);if(buildSpinner){buildSpinner.stopAndPersist();}result=(0,_formatWebpackMessages.default)(result);if(result.errors.length>0){// Only keep the first error. Others are often indicative
// of the same problem, but confuse the reader with noise.
if(result.errors.length>1){result.errors.length=1;}const error=result.errors.join('\n\n');console.error(_chalk.default.red('Failed to compile.\n'));if(error.indexOf('private-next-pages')>-1&&error.indexOf('does not contain a default export')>-1){const page_name_regex=/*#__PURE__*/_wrapRegExp(/'private\x2Dnext\x2Dpages\/((?:(?!')[\s\S])*)'/,{page_name:1});const parsed=page_name_regex.exec(error);const page_name=parsed&&parsed.groups&&parsed.groups.page_name;throw new Error(`webpack build failed: found page without a React Component as default export in pages/${page_name}\n\nSee https://err.sh/vercel/next.js/page-without-valid-component for more info.`);}console.error(error);console.error();if(error.indexOf('private-next-pages')>-1||error.indexOf('__next_polyfill__')>-1){throw new Error('> webpack config.resolve.alias was incorrectly overridden. https://err.sh/vercel/next.js/invalid-resolve-alias');}throw new Error('> Build failed because of webpack errors');}else{telemetry.record((0,_events.eventBuildCompleted)(pagePaths,{durationInSeconds:webpackBuildEnd[0]}));if(result.warnings.length>0){Log.warn('Compiled with warnings\n');console.warn(result.warnings.join('\n\n'));console.warn();}else{Log.info('Compiled successfully');}}const postCompileSpinner=(0,_spinner.default)({prefixText:`${Log.prefixes.info} Collecting page data`});const manifestPath=_path.default.join(distDir,isLikeServerless?_constants2.SERVERLESS_DIRECTORY:_constants2.SERVER_DIRECTORY,_constants2.PAGES_MANIFEST);const buildManifestPath=_path.default.join(distDir,_constants2.BUILD_MANIFEST);const ssgPages=new Set();const ssgStaticFallbackPages=new Set();const ssgBlockingFallbackPages=new Set();const staticPages=new Set();const invalidPages=new Set();const hybridAmpPages=new Set();const serverPropsPages=new Set();const additionalSsgPaths=new Map();const pageInfos=new Map();const pagesManifest=JSON.parse(await _fs.promises.readFile(manifestPath,'utf8'));const buildManifest=JSON.parse(await _fs.promises.readFile(buildManifestPath,'utf8'));let customAppGetInitialProps;let namedExports;let isNextImageImported;process.env.NEXT_PHASE=_constants2.PHASE_PRODUCTION_BUILD;const staticCheckWorkers=new _jestWorker.default(staticCheckWorker,{numWorkers:config.experimental.cpus,enableWorkerThreads:config.experimental.workerThreads});staticCheckWorkers.getStdout().pipe(process.stdout);staticCheckWorkers.getStderr().pipe(process.stderr);const runtimeEnvConfig={publicRuntimeConfig:config.publicRuntimeConfig,serverRuntimeConfig:config.serverRuntimeConfig};hasNonStaticErrorPage=hasCustomErrorPage&&(await(0,_utils2.hasCustomGetInitialProps)((0,_require.getPagePath)('/_error',distDir,isLikeServerless),runtimeEnvConfig,false));let hasSsrAmpPages=false;const analysisBegin=process.hrtime();await Promise.all(pageKeys.map(async page=>{const actualPage=(0,_normalizePagePath.normalizePagePath)(page);const[selfSize,allSize]=await(0,_utils2.getJsPageSizeInKb)(actualPage,distDir,buildManifest);let isSsg=false;let isStatic=false;let isHybridAmp=false;let ssgPageRoutes=null;const nonReservedPage=!page.match(/^\/(_app|_error|_document|api(\/|$))/);if(nonReservedPage){const serverBundle=(0,_require.getPagePath)(page,distDir,isLikeServerless);if(customAppGetInitialProps===undefined){customAppGetInitialProps=await(0,_utils2.hasCustomGetInitialProps)(isLikeServerless?serverBundle:(0,_require.getPagePath)('/_app',distDir,isLikeServerless),runtimeEnvConfig,true);namedExports=(0,_utils2.getNamedExports)(isLikeServerless?serverBundle:(0,_require.getPagePath)('/_app',distDir,isLikeServerless),runtimeEnvConfig);if(customAppGetInitialProps){console.warn(_chalk.default.bold.yellow(`Warning: `)+_chalk.default.yellow(`You have opted-out of Automatic Static Optimization due to \`getInitialProps\` in \`pages/_app\`. This does not opt-out pages with \`getStaticProps\``));console.warn('Read more: https://err.sh/next.js/opt-out-auto-static-optimization\n');}}try{var _config$i18n,_config$i18n2;let workerResult=await staticCheckWorkers.isPageStatic(page,serverBundle,runtimeEnvConfig,(_config$i18n=config.i18n)==null?void 0:_config$i18n.locales,(_config$i18n2=config.i18n)==null?void 0:_config$i18n2.defaultLocale);if(workerResult.isStatic===false&&(workerResult.isHybridAmp||workerResult.isAmpOnly)){hasSsrAmpPages=true;}if(workerResult.isHybridAmp){isHybridAmp=true;hybridAmpPages.add(page);}if(workerResult.isNextImageImported){isNextImageImported=true;}if(workerResult.hasStaticProps){ssgPages.add(page);isSsg=true;if(workerResult.prerenderRoutes){additionalSsgPaths.set(page,workerResult.prerenderRoutes);ssgPageRoutes=workerResult.prerenderRoutes;}if(workerResult.prerenderFallback==='blocking'){ssgBlockingFallbackPages.add(page);}else if(workerResult.prerenderFallback===true){ssgStaticFallbackPages.add(page);}}else if(workerResult.hasServerProps){serverPropsPages.add(page);}else if(workerResult.isStatic&&customAppGetInitialProps===false){staticPages.add(page);isStatic=true;}if(hasPages404&&page==='/404'){if(!workerResult.isStatic&&!workerResult.hasStaticProps){throw new Error(_constants.PAGES_404_GET_INITIAL_PROPS_ERROR);}// we need to ensure the 404 lambda is present since we use
// it when _app has getInitialProps
if(customAppGetInitialProps&&!workerResult.hasStaticProps){staticPages.delete(page);}}}catch(err){if(err.message!=='INVALID_DEFAULT_EXPORT')throw err;invalidPages.add(page);}}pageInfos.set(page,{size:selfSize,totalSize:allSize,static:isStatic,isSsg,isHybridAmp,ssgPageRoutes,initialRevalidateSeconds:false});}));staticCheckWorkers.end();if(!hasSsrAmpPages){requiredServerFiles.ignore.push(_path.default.relative(dir,_path.default.join(_path.default.dirname(require.resolve('@ampproject/toolbox-optimizer')),'**/*')));}if(serverPropsPages.size>0||ssgPages.size>0){// We update the routes manifest after the build with the
// data routes since we can't determine these until after build
routesManifest.dataRoutes=(0,_utils.getSortedRoutes)([...serverPropsPages,...ssgPages]).map(page=>{const pagePath=(0,_normalizePagePath.normalizePagePath)(page);const dataRoute=_path.default.posix.join('/_next/data',buildId,`${pagePath}.json`);let dataRouteRegex;let namedDataRouteRegex;let routeKeys;if((0,_utils.isDynamicRoute)(page)){const routeRegex=(0,_utils.getRouteRegex)(dataRoute.replace(/\.json$/,''));dataRouteRegex=(0,_loadCustomRoutes.normalizeRouteRegex)(routeRegex.re.source.replace(/\(\?:\\\/\)\?\$$/,'\\.json$'));namedDataRouteRegex=routeRegex.namedRegex.replace(/\(\?:\/\)\?\$$/,'\\.json$');routeKeys=routeRegex.routeKeys;}else{dataRouteRegex=(0,_loadCustomRoutes.normalizeRouteRegex)(new RegExp(`^${_path.default.posix.join('/_next/data',(0,_escapeStringRegexp.default)(buildId),`${pagePath}.json`)}$`).source);}return{page,routeKeys,dataRouteRegex,namedDataRouteRegex};});await _fs.promises.writeFile(routesManifestPath,JSON.stringify(routesManifest),'utf8');}// Since custom _app.js can wrap the 404 page we have to opt-out of static optimization if it has getInitialProps
// Only export the static 404 when there is no /_error present
const useStatic404=!customAppGetInitialProps&&(!hasNonStaticErrorPage||hasPages404);if(invalidPages.size>0){throw new Error(`Build optimization failed: found page${invalidPages.size===1?'':'s'} without a React Component as default export in \n${[...invalidPages].map(pg=>`pages${pg}`).join('\n')}\n\nSee https://err.sh/vercel/next.js/page-without-valid-component for more info.\n`);}await(0,_writeBuildId.writeBuildId)(distDir,buildId);await _fs.promises.writeFile(_path.default.join(distDir,_constants2.SERVER_FILES_MANIFEST),JSON.stringify(requiredServerFiles),'utf8');const finalPrerenderRoutes={};const tbdPrerenderRoutes=[];let ssgNotFoundPaths=[];if(postCompileSpinner)postCompileSpinner.stopAndPersist();if(staticPages.size>0||ssgPages.size>0||useStatic404){const combinedPages=[...staticPages,...ssgPages];const exportApp=require('../export').default;const exportOptions={silent:false,buildExport:true,threads:config.experimental.cpus,pages:combinedPages,outdir:_path.default.join(distDir,'export'),statusMessage:'Generating static pages'};const exportConfig={...config,initialPageRevalidationMap:{},ssgNotFoundPaths:[],// Default map will be the collection of automatic statically exported
// pages and incremental pages.
// n.b. we cannot handle this above in combinedPages because the dynamic
// page must be in the `pages` array, but not in the mapping.
exportPathMap:defaultMap=>{const{i18n}=config;// Dynamically routed pages should be prerendered to be used as
// a client-side skeleton (fallback) while data is being fetched.
// This ensures the end-user never sees a 500 or slow response from the
// server.
//
// Note: prerendering disables automatic static optimization.
ssgPages.forEach(page=>{if((0,_utils.isDynamicRoute)(page)){tbdPrerenderRoutes.push(page);if(ssgStaticFallbackPages.has(page)){// Override the rendering for the dynamic page to be treated as a
// fallback render.
if(i18n){defaultMap[`/${i18n.defaultLocale}${page}`]={page,query:{__nextFallback:true}};}else{defaultMap[page]={page,query:{__nextFallback:true}};}}else{// Remove dynamically routed pages from the default path map when
// fallback behavior is disabled.
delete defaultMap[page];}}});// Append the "well-known" routes we should prerender for, e.g. blog
// post slugs.
additionalSsgPaths.forEach((routes,page)=>{routes.forEach(route=>{defaultMap[route]={page};});});if(useStatic404){defaultMap['/404']={page:hasPages404?'/404':'/_error'};}if(i18n){for(const page of[...staticPages,...ssgPages,...(useStatic404?['/404']:[])]){const isSsg=ssgPages.has(page);const isDynamic=(0,_utils.isDynamicRoute)(page);const isFallback=isSsg&&ssgStaticFallbackPages.has(page);for(const locale of i18n.locales){var _defaultMap$page;// skip fallback generation for SSG pages without fallback mode
if(isSsg&&isDynamic&&!isFallback)continue;const outputPath=`/${locale}${page==='/'?'':page}`;defaultMap[outputPath]={page:((_defaultMap$page=defaultMap[page])==null?void 0:_defaultMap$page.page)||page,query:{__nextLocale:locale}};if(isFallback){defaultMap[outputPath].query.__nextFallback=true;}}if(isSsg){// remove non-locale prefixed variant from defaultMap
delete defaultMap[page];}}}return defaultMap;},trailingSlash:false};await exportApp(dir,exportOptions,exportConfig);const postBuildSpinner=(0,_spinner.default)({prefixText:`${Log.prefixes.info} Finalizing page optimization`});ssgNotFoundPaths=exportConfig.ssgNotFoundPaths;// remove server bundles that were exported
for(const page of staticPages){const serverBundle=(0,_require.getPagePath)(page,distDir,isLikeServerless);await _fs.promises.unlink(serverBundle);}const serverOutputDir=_path.default.join(distDir,isLikeServerless?_constants2.SERVERLESS_DIRECTORY:_constants2.SERVER_DIRECTORY);const moveExportedPage=async(originPage,page,file,isSsg,ext,additionalSsgFile=false)=>{file=`${file}.${ext}`;const orig=_path.default.join(exportOptions.outdir,file);const pagePath=(0,_require.getPagePath)(originPage,distDir,isLikeServerless);const relativeDest=_path.default.relative(serverOutputDir,_path.default.join(_path.default.join(pagePath,// strip leading / and then recurse number of nested dirs
// to place from base folder
originPage.substr(1).split('/').map(()=>'..').join('/')),file)).replace(/\\/g,'/');const dest=_path.default.join(distDir,isLikeServerless?_constants2.SERVERLESS_DIRECTORY:_constants2.SERVER_DIRECTORY,relativeDest);if(!isSsg){pagesManifest[page]=relativeDest;}const{i18n}=config;const isNotFound=ssgNotFoundPaths.includes(page);// for SSG files with i18n the non-prerendered variants are
// output with the locale prefixed so don't attempt moving
// without the prefix
if((!i18n||additionalSsgFile)&&!isNotFound){await _fs.promises.mkdir(_path.default.dirname(dest),{recursive:true});await _fs.promises.rename(orig,dest);}else if(i18n&&!isSsg){// this will be updated with the locale prefixed variant
// since all files are output with the locale prefix
delete pagesManifest[page];}if(i18n){if(additionalSsgFile)return;for(const locale of i18n.locales){const curPath=`/${locale}${page==='/'?'':page}`;const localeExt=page==='/'?_path.default.extname(file):'';const relativeDestNoPages=relativeDest.substr('pages/'.length);if(isSsg&&ssgNotFoundPaths.includes(curPath)){continue;}const updatedRelativeDest=_path.default.join('pages',locale+localeExt,// if it's the top-most index page we want it to be locale.EXT
// instead of locale/index.html
page==='/'?'':relativeDestNoPages);const updatedOrig=_path.default.join(exportOptions.outdir,locale+localeExt,page==='/'?'':file);const updatedDest=_path.default.join(distDir,isLikeServerless?_constants2.SERVERLESS_DIRECTORY:_constants2.SERVER_DIRECTORY,updatedRelativeDest);if(!isSsg){pagesManifest[curPath]=updatedRelativeDest;}await _fs.promises.mkdir(_path.default.dirname(updatedDest),{recursive:true});await _fs.promises.rename(updatedOrig,updatedDest);}}};// Only move /404 to /404 when there is no custom 404 as in that case we don't know about the 404 page
if(!hasPages404&&useStatic404){await moveExportedPage('/_error','/404','/404',false,'html');}for(const page of combinedPages){const isSsg=ssgPages.has(page);const isStaticSsgFallback=ssgStaticFallbackPages.has(page);const isDynamic=(0,_utils.isDynamicRoute)(page);const hasAmp=hybridAmpPages.has(page);const file=(0,_normalizePagePath.normalizePagePath)(page);// The dynamic version of SSG pages are only prerendered if the fallback
// is enabled. Below, we handle the specific prerenders of these.
if(!(isSsg&&isDynamic&&!isStaticSsgFallback)){await moveExportedPage(page,page,file,isSsg,'html');}if(hasAmp&&(!isSsg||isSsg&&!isDynamic)){const ampPage=`${file}.amp`;await moveExportedPage(page,ampPage,ampPage,isSsg,'html');if(isSsg){await moveExportedPage(page,ampPage,ampPage,isSsg,'json');}}if(isSsg){const{i18n}=config;// For a non-dynamic SSG page, we must copy its data file from export.
if(!isDynamic){await moveExportedPage(page,page,file,true,'json');const revalidationMapPath=i18n?`/${i18n.defaultLocale}${page==='/'?'':page}`:page;finalPrerenderRoutes[page]={initialRevalidateSeconds:exportConfig.initialPageRevalidationMap[revalidationMapPath],srcRoute:null,dataRoute:_path.default.posix.join('/_next/data',buildId,`${file}.json`)};// Set Page Revalidation Interval
const pageInfo=pageInfos.get(page);if(pageInfo){pageInfo.initialRevalidateSeconds=exportConfig.initialPageRevalidationMap[revalidationMapPath];pageInfos.set(page,pageInfo);}}else{// For a dynamic SSG page, we did not copy its data exports and only
// copy the fallback HTML file (if present).
// We must also copy specific versions of this page as defined by
// `getStaticPaths` (additionalSsgPaths).
const extraRoutes=additionalSsgPaths.get(page)||[];for(const route of extraRoutes){const pageFile=(0,_normalizePagePath.normalizePagePath)(route);await moveExportedPage(page,route,pageFile,true,'html',true);await moveExportedPage(page,route,pageFile,true,'json',true);if(hasAmp){const ampPage=`${pageFile}.amp`;await moveExportedPage(page,ampPage,ampPage,true,'html',true);await moveExportedPage(page,ampPage,ampPage,true,'json',true);}finalPrerenderRoutes[route]={initialRevalidateSeconds:exportConfig.initialPageRevalidationMap[route],srcRoute:page,dataRoute:_path.default.posix.join('/_next/data',buildId,`${(0,_normalizePagePath.normalizePagePath)(route)}.json`)};// Set route Revalidation Interval
const pageInfo=pageInfos.get(route);if(pageInfo){pageInfo.initialRevalidateSeconds=exportConfig.initialPageRevalidationMap[route];pageInfos.set(route,pageInfo);}}}}}// remove temporary export folder
await(0,_recursiveDelete.recursiveDelete)(exportOptions.outdir);await _fs.promises.rmdir(exportOptions.outdir);await _fs.promises.writeFile(manifestPath,JSON.stringify(pagesManifest,null,2),'utf8');if(postBuildSpinner)postBuildSpinner.stopAndPersist();console.log();}const analysisEnd=process.hrtime(analysisBegin);telemetry.record((0,_events.eventBuildOptimize)(pagePaths,{durationInSeconds:analysisEnd[0],staticPageCount:staticPages.size,staticPropsPageCount:ssgPages.size,serverPropsPageCount:serverPropsPages.size,ssrPageCount:pagePaths.length-(staticPages.size+ssgPages.size+serverPropsPages.size),hasStatic404:useStatic404,hasReportWebVitals:(_namedExports$include=(_namedExports=namedExports)==null?void 0:_namedExports.includes('reportWebVitals'))!=null?_namedExports$include:false,rewritesCount:rewrites.length,headersCount:headers.length,redirectsCount:redirects.length-1// reduce one for trailing slash
}));if(ssgPages.size>0){const finalDynamicRoutes={};tbdPrerenderRoutes.forEach(tbdRoute=>{const normalizedRoute=(0,_normalizePagePath.normalizePagePath)(tbdRoute);const dataRoute=_path.default.posix.join('/_next/data',buildId,`${normalizedRoute}.json`);finalDynamicRoutes[tbdRoute]={routeRegex:(0,_loadCustomRoutes.normalizeRouteRegex)((0,_utils.getRouteRegex)(tbdRoute).re.source),dataRoute,fallback:ssgBlockingFallbackPages.has(tbdRoute)?null:ssgStaticFallbackPages.has(tbdRoute)?`${normalizedRoute}.html`:false,dataRouteRegex:(0,_loadCustomRoutes.normalizeRouteRegex)((0,_utils.getRouteRegex)(dataRoute.replace(/\.json$/,'')).re.source.replace(/\(\?:\\\/\)\?\$$/,'\\.json$'))};});const prerenderManifest={version:2,routes:finalPrerenderRoutes,dynamicRoutes:finalDynamicRoutes,notFoundRoutes:ssgNotFoundPaths,preview:previewProps};await _fs.promises.writeFile(_path.default.join(distDir,_constants2.PRERENDER_MANIFEST),JSON.stringify(prerenderManifest),'utf8');await generateClientSsgManifest(prerenderManifest,{distDir,buildId});}else{const prerenderManifest={version:2,routes:{},dynamicRoutes:{},preview:previewProps,notFoundRoutes:[]};await _fs.promises.writeFile(_path.default.join(distDir,_constants2.PRERENDER_MANIFEST),JSON.stringify(prerenderManifest),'utf8');}const images={...config.images};const{deviceSizes,imageSizes}=images;images.sizes=[...deviceSizes,...imageSizes];await _fs.promises.writeFile(_path.default.join(distDir,_constants2.IMAGES_MANIFEST),JSON.stringify({version:1,images}),'utf8');await _fs.promises.writeFile(_path.default.join(distDir,_constants2.EXPORT_MARKER),JSON.stringify({version:1,hasExportPathMap:typeof config.exportPathMap==='function',exportTrailingSlash:config.trailingSlash===true,isNextImageImported:isNextImageImported===true}),'utf8');await _fs.promises.unlink(_path.default.join(distDir,_constants2.EXPORT_DETAIL)).catch(err=>{if(err.code==='ENOENT'){return Promise.resolve();}return Promise.reject(err);});staticPages.forEach(pg=>allStaticPages.add(pg));pageInfos.forEach((info,key)=>{allPageInfos.set(key,info);});await(0,_utils2.printTreeView)(Object.keys(mappedPages),allPageInfos,isLikeServerless,{distPath:distDir,buildId:buildId,pagesDir,useStatic404,pageExtensions:config.pageExtensions,buildManifest});if(debugOutput){(0,_utils2.printCustomRoutes)({redirects,rewrites,headers});}if(config.analyticsId){console.log(_chalk.default.bold.green('Next.js Analytics')+' is enabled for this production build. '+"You'll receive a Real Experience Score computed by all of your visitors.");console.log('');}if(tracer){const parsedResults=await tracer.profiler.stopProfiling();await new Promise(resolve=>{if(parsedResults===undefined){tracer.profiler.destroy();tracer.trace.flush();tracer.end(resolve);return;}const cpuStartTime=parsedResults.profile.startTime;const cpuEndTime=parsedResults.profile.endTime;tracer.trace.completeEvent({name:'TaskQueueManager::ProcessTaskFromWorkQueue',id:++tracer.counter,cat:['toplevel'],ts:cpuStartTime,args:{src_file:'../../ipc/ipc_moji_bootstrap.cc',src_func:'Accept'}});tracer.trace.completeEvent({name:'EvaluateScript',id:++tracer.counter,cat:['devtools.timeline'],ts:cpuStartTime,dur:cpuEndTime-cpuStartTime,args:{data:{url:'webpack',lineNumber:1,columnNumber:1,frame:'0xFFF'}}});tracer.trace.instantEvent({name:'CpuProfile',id:++tracer.counter,cat:['disabled-by-default-devtools.timeline'],ts:cpuEndTime,args:{data:{cpuProfile:parsedResults.profile}}});tracer.profiler.destroy();tracer.trace.flush();tracer.end(resolve);});}await telemetry.flush();}function generateClientSsgManifest(prerenderManifest,{buildId,distDir}){const ssgPages=new Set([...Object.entries(prerenderManifest.routes)// Filter out dynamic routes
.filter(([,{srcRoute}])=>srcRoute==null).map(([route])=>route),...Object.keys(prerenderManifest.dynamicRoutes)]);const clientSsgManifestContent=`self.__SSG_MANIFEST=${(0,_devalue.default)(ssgPages)};self.__SSG_MANIFEST_CB&&self.__SSG_MANIFEST_CB()`;(0,_fs.writeFileSync)(_path.default.join(distDir,_constants2.CLIENT_STATIC_FILES_PATH,buildId,'_ssgManifest.js'),clientSsgManifestContent);}
//# sourceMappingURL=index.js.map