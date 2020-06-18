"use strict";exports.__esModule=true;exports.default=exportApp;var _chalk=_interopRequireDefault(require("next/dist/compiled/chalk"));var _findUp=_interopRequireDefault(require("next/dist/compiled/find-up"));var _fs=require("fs");var _jestWorker=_interopRequireDefault(require("jest-worker"));var _os=require("os");var _path=require("path");var _util=require("util");var _index=require("../build/output/index");var _spinner=_interopRequireDefault(require("../build/spinner"));var _constants=require("../lib/constants");var _recursiveCopy=require("../lib/recursive-copy");var _recursiveDelete=require("../lib/recursive-delete");var _constants2=require("../next-server/lib/constants");var _config=_interopRequireWildcard(require("../next-server/server/config"));var _events=require("../telemetry/events");var _storage=require("../telemetry/storage");var _normalizePagePath=require("../next-server/server/normalize-page-path");var _loadEnvConfig=require("../lib/load-env-config");function _getRequireWildcardCache(){if(typeof WeakMap!=="function")return null;var cache=new WeakMap();_getRequireWildcardCache=function(){return cache;};return cache;}function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj;}if(obj===null||typeof obj!=="object"&&typeof obj!=="function"){return{default:obj};}var cache=_getRequireWildcardCache();if(cache&&cache.has(obj)){return cache.get(obj);}var newObj={};var hasPropertyDescriptor=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key)){var desc=hasPropertyDescriptor?Object.getOwnPropertyDescriptor(obj,key):null;if(desc&&(desc.get||desc.set)){Object.defineProperty(newObj,key,desc);}else{newObj[key]=obj[key];}}}newObj.default=obj;if(cache){cache.set(obj,newObj);}return newObj;}function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}const exists=(0,_util.promisify)(_fs.exists);const createProgress=(total,label='Exporting')=>{let curProgress=0;let progressSpinner=(0,_spinner.default)(`${label} (${curProgress}/${total})`,{spinner:{frames:['[    ]','[=   ]','[==  ]','[=== ]','[ ===]','[  ==]','[   =]','[    ]','[   =]','[  ==]','[ ===]','[====]','[=== ]','[==  ]','[=   ]'],interval:80}});return()=>{curProgress++;const newText=`${label} (${curProgress}/${total})`;if(progressSpinner){progressSpinner.text=newText;}else{console.log(newText);}if(curProgress===total&&progressSpinner){progressSpinner.stop();console.log(newText);}};};async function exportApp(dir,options,configuration){var _nextConfig$amp,_nextConfig$experimen,_nextConfig$experimen2,_nextConfig$experimen3;function log(message){if(options.silent){return;}console.log(message);}dir=(0,_path.resolve)(dir);// attempt to load global env values so they are available in next.config.js
(0,_loadEnvConfig.loadEnvConfig)(dir);const nextConfig=configuration||(0,_config.default)(_constants2.PHASE_EXPORT,dir);const threads=options.threads||Math.max((0,_os.cpus)().length-1,1);const distDir=(0,_path.join)(dir,nextConfig.distDir);const telemetry=options.buildExport?null:new _storage.Telemetry({distDir});if(telemetry){telemetry.record((0,_events.eventCliSession)(_constants2.PHASE_EXPORT,distDir,{cliCommand:'export',isSrcDir:null,hasNowJson:!!(await(0,_findUp.default)('now.json',{cwd:dir})),isCustomServer:null}));}const subFolders=nextConfig.exportTrailingSlash;const isLikeServerless=nextConfig.target!=='server';log(`> using build directory: ${distDir}`);if(!(0,_fs.existsSync)(distDir)){throw new Error(`Build directory ${distDir} does not exist. Make sure you run "next build" before running "next start" or "next export".`);}const buildId=(0,_fs.readFileSync)((0,_path.join)(distDir,_constants2.BUILD_ID_FILE),'utf8');const pagesManifest=!options.pages&&require((0,_path.join)(distDir,isLikeServerless?_constants2.SERVERLESS_DIRECTORY:_constants2.SERVER_DIRECTORY,_constants2.PAGES_MANIFEST));let prerenderManifest=undefined;try{prerenderManifest=require((0,_path.join)(distDir,_constants2.PRERENDER_MANIFEST));}catch(_){}const distPagesDir=(0,_path.join)(distDir,isLikeServerless?_constants2.SERVERLESS_DIRECTORY:(0,_path.join)(_constants2.SERVER_DIRECTORY,'static',buildId),'pages');const excludedPrerenderRoutes=new Set();const pages=options.pages||Object.keys(pagesManifest);const defaultPathMap={};let hasApiRoutes=false;for(const page of pages){var _prerenderManifest;// _document and _app are not real pages
// _error is exported as 404.html later on
// API Routes are Node.js functions
if(page.match(_constants.API_ROUTE)){hasApiRoutes=true;continue;}if(page==='/_document'||page==='/_app'||page==='/_error'){continue;}// iSSG pages that are dynamic should not export templated version by
// default. In most cases, this would never work. There is no server that
// could run `getStaticProps`. If users make their page work lazily, they
// can manually add it to the `exportPathMap`.
if((_prerenderManifest=prerenderManifest)===null||_prerenderManifest===void 0?void 0:_prerenderManifest.dynamicRoutes[page]){excludedPrerenderRoutes.add(page);continue;}defaultPathMap[page]={page};}// Initialize the output directory
const outDir=options.outdir;if(outDir===(0,_path.join)(dir,'public')){throw new Error(`The 'public' directory is reserved in Next.js and can not be used as the export out directory. https://err.sh/vercel/next.js/can-not-output-to-public`);}await(0,_recursiveDelete.recursiveDelete)((0,_path.join)(outDir));await _fs.promises.mkdir((0,_path.join)(outDir,'_next',buildId),{recursive:true});(0,_fs.writeFileSync)((0,_path.join)(distDir,_constants2.EXPORT_DETAIL),JSON.stringify({version:1,outDirectory:outDir,success:false}),'utf8');// Copy static directory
if(!options.buildExport&&(0,_fs.existsSync)((0,_path.join)(dir,'static'))){log('  copying "static" directory');await(0,_recursiveCopy.recursiveCopy)((0,_path.join)(dir,'static'),(0,_path.join)(outDir,'static'));}// Copy .next/static directory
if((0,_fs.existsSync)((0,_path.join)(distDir,_constants2.CLIENT_STATIC_FILES_PATH))){log('  copying "static build" directory');await(0,_recursiveCopy.recursiveCopy)((0,_path.join)(distDir,_constants2.CLIENT_STATIC_FILES_PATH),(0,_path.join)(outDir,'_next',_constants2.CLIENT_STATIC_FILES_PATH));}// Get the exportPathMap from the config file
if(typeof nextConfig.exportPathMap!=='function'){console.log(`> No "exportPathMap" found in "${_constants2.CONFIG_FILE}". Generating map from "./pages"`);nextConfig.exportPathMap=async defaultMap=>{return defaultMap;};}// Start the rendering process
const renderOpts={dir,buildId,nextExport:true,assetPrefix:nextConfig.assetPrefix.replace(/\/$/,''),distDir,dev:false,hotReloader:null,basePath:nextConfig.basePath,canonicalBase:((_nextConfig$amp=nextConfig.amp)===null||_nextConfig$amp===void 0?void 0:_nextConfig$amp.canonicalBase)||'',isModern:nextConfig.experimental.modern,ampValidatorPath:((_nextConfig$experimen=nextConfig.experimental.amp)===null||_nextConfig$experimen===void 0?void 0:_nextConfig$experimen.validator)||undefined,ampSkipValidation:((_nextConfig$experimen2=nextConfig.experimental.amp)===null||_nextConfig$experimen2===void 0?void 0:_nextConfig$experimen2.skipValidation)||false,ampOptimizerConfig:((_nextConfig$experimen3=nextConfig.experimental.amp)===null||_nextConfig$experimen3===void 0?void 0:_nextConfig$experimen3.optimizer)||undefined};const{serverRuntimeConfig,publicRuntimeConfig}=nextConfig;if(Object.keys(publicRuntimeConfig).length>0){;renderOpts.runtimeConfig=publicRuntimeConfig;}// We need this for server rendering the Link component.
;global.__NEXT_DATA__={nextExport:true};log(`  launching ${threads} workers`);const exportPathMap=await nextConfig.exportPathMap(defaultPathMap,{dev:false,dir,outDir,distDir,buildId});if(!exportPathMap['/404']&&!exportPathMap['/404.html']){exportPathMap['/404']=exportPathMap['/404.html']={page:'/_error'};}// make sure to prevent duplicates
const exportPaths=[...new Set(Object.keys(exportPathMap).map(path=>(0,_normalizePagePath.denormalizePagePath)((0,_normalizePagePath.normalizePagePath)(path))))];const filteredPaths=exportPaths.filter(// Remove API routes
route=>!exportPathMap[route].page.match(_constants.API_ROUTE));if(filteredPaths.length!==exportPaths.length){hasApiRoutes=true;}if(prerenderManifest&&!options.buildExport){const fallbackTruePages=new Set();for(const key of Object.keys(prerenderManifest.dynamicRoutes)){// only error if page is included in path map
if(!exportPathMap[key]&&!excludedPrerenderRoutes.has(key)){continue;}if(prerenderManifest.dynamicRoutes[key].fallback!==false){fallbackTruePages.add(key);}}if(fallbackTruePages.size){throw new Error(`Found pages with \`fallback: true\`:\n${[...fallbackTruePages].join('\n')}\n${_constants.SSG_FALLBACK_EXPORT_ERROR}\n`);}}// Warn if the user defines a path for an API page
if(hasApiRoutes){log(_chalk.default.bold.red(`Warning`)+': '+_chalk.default.yellow(`Statically exporting a Next.js application via \`next export\` disables API routes.`)+`\n`+_chalk.default.yellow(`This command is meant for static-only hosts, and is`+' '+_chalk.default.bold(`not necessary to make your application static.`))+`\n`+_chalk.default.yellow(`Pages in your application without server-side data dependencies will be automatically statically exported by \`next build\`, including pages powered by \`getStaticProps\`.`)+`\nLearn more: https://err.sh/vercel/next.js/api-routes-static-export`);}const progress=!options.silent&&createProgress(filteredPaths.length);const pagesDataDir=options.buildExport?outDir:(0,_path.join)(outDir,'_next/data',buildId);const ampValidations={};let hadValidationError=false;const publicDir=(0,_path.join)(dir,_constants2.CLIENT_PUBLIC_FILES_PATH);// Copy public directory
if(!options.buildExport&&(0,_fs.existsSync)(publicDir)){log('  copying "public" directory');await(0,_recursiveCopy.recursiveCopy)(publicDir,outDir,{filter(path){// Exclude paths used by pages
return!exportPathMap[path];}});}const worker=new _jestWorker.default(require.resolve('./worker'),{maxRetries:0,numWorkers:threads,enableWorkerThreads:nextConfig.experimental.workerThreads,exposedMethods:['default']});worker.getStdout().pipe(process.stdout);worker.getStderr().pipe(process.stderr);let renderError=false;const errorPaths=[];await Promise.all(filteredPaths.map(async path=>{const result=await worker.default({path,pathMap:exportPathMap[path],distDir,outDir,pagesDataDir,renderOpts,serverRuntimeConfig,subFolders,buildExport:options.buildExport,serverless:(0,_config.isTargetLikeServerless)(nextConfig.target)});for(const validation of result.ampValidations||[]){const{page,result:ampValidationResult}=validation;ampValidations[page]=ampValidationResult;hadValidationError=hadValidationError||Array.isArray(ampValidationResult===null||ampValidationResult===void 0?void 0:ampValidationResult.errors)&&ampValidationResult.errors.length>0;}renderError=renderError||!!result.error;if(!!result.error)errorPaths.push(path);if(options.buildExport&&typeof result.fromBuildExportRevalidate!=='undefined'){configuration.initialPageRevalidationMap[path]=result.fromBuildExportRevalidate;}if(progress)progress();}));worker.end();// copy prerendered routes to outDir
if(!options.buildExport&&prerenderManifest){await Promise.all(Object.keys(prerenderManifest.routes).map(async route=>{route=(0,_normalizePagePath.normalizePagePath)(route);const orig=(0,_path.join)(distPagesDir,route);const htmlDest=(0,_path.join)(outDir,`${route}${subFolders&&route!=='/index'?`${_path.sep}index`:''}.html`);const ampHtmlDest=(0,_path.join)(outDir,`${route}.amp${subFolders?`${_path.sep}index`:''}.html`);const jsonDest=(0,_path.join)(pagesDataDir,`${route}.json`);await _fs.promises.mkdir((0,_path.dirname)(htmlDest),{recursive:true});await _fs.promises.mkdir((0,_path.dirname)(jsonDest),{recursive:true});await _fs.promises.copyFile(`${orig}.html`,htmlDest);await _fs.promises.copyFile(`${orig}.json`,jsonDest);if(await exists(`${orig}.amp.html`)){await _fs.promises.mkdir((0,_path.dirname)(ampHtmlDest),{recursive:true});await _fs.promises.copyFile(`${orig}.amp.html`,ampHtmlDest);}}));}if(Object.keys(ampValidations).length){console.log((0,_index.formatAmpMessages)(ampValidations));}if(hadValidationError){throw new Error(`AMP Validation caused the export to fail. https://err.sh/vercel/next.js/amp-export-validation`);}if(renderError){throw new Error(`Export encountered errors on following paths:\n\t${errorPaths.sort().join('\n\t')}`);}// Add an empty line to the console for the better readability.
log('');(0,_fs.writeFileSync)((0,_path.join)(distDir,_constants2.EXPORT_DETAIL),JSON.stringify({version:1,outDirectory:outDir,success:true}),'utf8');if(telemetry){await telemetry.flush();}}
//# sourceMappingURL=index.js.map