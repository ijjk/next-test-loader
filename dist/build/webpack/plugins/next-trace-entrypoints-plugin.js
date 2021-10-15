"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var _path = _interopRequireDefault(require("path"));
var _profilingPlugin = require("./profiling-plugin");
var _isError = _interopRequireDefault(require("../../../lib/is-error"));
var _nodeFileTrace = require("next/dist/compiled/@vercel/nft");
var _constants = require("../../../shared/lib/constants");
var _webpack = require("next/dist/compiled/webpack/webpack");
var _webpackConfig = require("../../webpack-config");
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const PLUGIN_NAME = 'TraceEntryPointsPlugin';
const TRACE_IGNORES = [
    '**/*/node_modules/react/**/*.development.js',
    '**/*/node_modules/react-dom/**/*.development.js',
    '**/*/next/dist/server/next.js',
    '**/*/next/dist/bin/next', 
];
function getModuleFromDependency(compilation, dep) {
    return compilation.moduleGraph.getModule(dep);
}
class TraceEntryPointsPlugin {
    constructor({ appDir , excludeFiles , esmExternals  }){
        this.appDir = appDir;
        this.entryTraces = new Map();
        this.esmExternals = esmExternals;
        this.excludeFiles = excludeFiles || [];
    }
    // Here we output all traced assets and webpack chunks to a
    // ${page}.js.nft.json file
    createTraceAssets(compilation, assets, span) {
        const outputPath = compilation.outputOptions.path;
        const nodeFileTraceSpan = span.traceChild('create-trace-assets');
        nodeFileTraceSpan.traceFn(()=>{
            for (const entrypoint of compilation.entrypoints.values()){
                const entryFiles = new Set();
                for (const chunk of entrypoint.getEntrypointChunk().getAllReferencedChunks()){
                    for (const file of chunk.files){
                        entryFiles.add(_path.default.join(outputPath, file));
                    }
                    for (const file1 of chunk.auxiliaryFiles){
                        entryFiles.add(_path.default.join(outputPath, file1));
                    }
                }
                // don't include the entry itself in the trace
                entryFiles.delete(_path.default.join(outputPath, `../${entrypoint.name}.js`));
                const traceOutputName = `../${entrypoint.name}.js.nft.json`;
                const traceOutputPath = _path.default.dirname(_path.default.join(outputPath, traceOutputName));
                assets[traceOutputName] = new _webpack.sources.RawSource(JSON.stringify({
                    version: _constants.TRACE_OUTPUT_VERSION,
                    files: [
                        ...entryFiles,
                        ...this.entryTraces.get(entrypoint.name) || [], 
                    ].map((file)=>{
                        return _path.default.relative(traceOutputPath, file).replace(/\\/g, '/');
                    })
                }));
            }
        });
    }
    tapfinishModules(compilation, traceEntrypointsPluginSpan, doResolve) {
        compilation.hooks.finishModules.tapAsync(PLUGIN_NAME, async (_stats, callback)=>{
            const finishModulesSpan = traceEntrypointsPluginSpan.traceChild('finish-modules');
            await finishModulesSpan.traceAsyncFn(async ()=>{
                // we create entry -> module maps so that we can
                // look them up faster instead of having to iterate
                // over the compilation modules list
                const entryNameMap = new Map();
                const entryModMap = new Map();
                const additionalEntries = new Map();
                const depModMap = new Map();
                finishModulesSpan.traceChild('get-entries').traceFn(()=>{
                    compilation.entries.forEach((entry)=>{
                        var ref;
                        const name = entry.name || ((ref = entry.options) === null || ref === void 0 ? void 0 : ref.name);
                        if (name === null || name === void 0 ? void 0 : name.replace(/\\/g, '/').startsWith('pages/')) {
                            for (const dep of entry.dependencies){
                                if (!dep) continue;
                                const entryMod = getModuleFromDependency(compilation, dep);
                                if (entryMod && entryMod.resource) {
                                    if (entryMod.resource.replace(/\\/g, '/').includes('pages/')) {
                                        entryNameMap.set(entryMod.resource, name);
                                        entryModMap.set(entryMod.resource, entryMod);
                                    } else {
                                        let curMap = additionalEntries.get(name);
                                        if (!curMap) {
                                            curMap = new Map();
                                            additionalEntries.set(name, curMap);
                                        }
                                        depModMap.set(entryMod.resource, entryMod);
                                        curMap.set(entryMod.resource, entryMod);
                                    }
                                }
                            }
                        }
                    });
                });
                const readFile = async (path)=>{
                    var ref;
                    const mod = depModMap.get(path) || entryModMap.get(path);
                    // map the transpiled source when available to avoid
                    // parse errors in node-file-trace
                    const source = mod === null || mod === void 0 ? void 0 : (ref = mod.originalSource) === null || ref === void 0 ? void 0 : ref.call(mod);
                    if (source) {
                        return source.buffer();
                    }
                    try {
                        return await new Promise((resolve, reject)=>{
                            compilation.inputFileSystem.readFile(path, (err, data)=>{
                                if (err) return reject(err);
                                resolve(data);
                            });
                        });
                    } catch (e) {
                        if ((0, _isError).default(e) && (e.code === 'ENOENT' || e.code === 'EISDIR')) {
                            return null;
                        }
                        throw e;
                    }
                };
                const readlink = async (path)=>{
                    try {
                        return await new Promise((resolve, reject)=>{
                            compilation.inputFileSystem.readlink(path, (err, link)=>{
                                if (err) return reject(err);
                                resolve(link);
                            });
                        });
                    } catch (e) {
                        if ((0, _isError).default(e) && (e.code === 'EINVAL' || e.code === 'ENOENT' || e.code === 'UNKNOWN')) {
                            return null;
                        }
                        throw e;
                    }
                };
                const stat = async (path)=>{
                    try {
                        return await new Promise((resolve, reject)=>{
                            compilation.inputFileSystem.stat(path, (err, stats)=>{
                                if (err) return reject(err);
                                resolve(stats);
                            });
                        });
                    } catch (e) {
                        if ((0, _isError).default(e) && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) {
                            return null;
                        }
                        throw e;
                    }
                };
                const entryPaths = Array.from(entryModMap.keys());
                const collectDependencies = (mod)=>{
                    if (!mod || !mod.dependencies) return;
                    for (const dep of mod.dependencies){
                        const depMod = getModuleFromDependency(compilation, dep);
                        if ((depMod === null || depMod === void 0 ? void 0 : depMod.resource) && !depModMap.get(depMod.resource)) {
                            depModMap.set(depMod.resource, depMod);
                            collectDependencies(depMod);
                        }
                    }
                };
                const entriesToTrace = [
                    ...entryPaths
                ];
                entryPaths.forEach((entry)=>{
                    collectDependencies(entryModMap.get(entry));
                    const entryName = entryNameMap.get(entry);
                    const curExtraEntries = additionalEntries.get(entryName);
                    if (curExtraEntries) {
                        entriesToTrace.push(...curExtraEntries.keys());
                    }
                });
                let fileList;
                let reasons;
                const root = _path.default.parse(process.cwd()).root;
                await finishModulesSpan.traceChild('node-file-trace', {
                    traceEntryCount: entriesToTrace.length + ''
                }).traceAsyncFn(async ()=>{
                    const result = await (0, _nodeFileTrace).nodeFileTrace(entriesToTrace, {
                        base: root,
                        processCwd: this.appDir,
                        readFile,
                        readlink,
                        stat,
                        resolve: doResolve ? (id, parent, job, isCjs)=>// @ts-ignore
                            doResolve(id, parent, job, !isCjs)
                         : undefined,
                        ignore: [
                            ...TRACE_IGNORES,
                            ...this.excludeFiles
                        ],
                        mixedModules: true
                    });
                    // @ts-ignore
                    fileList = result.fileList;
                    result.esmFileList.forEach((file)=>fileList.add(file)
                    );
                    reasons = result.reasons;
                });
                // this uses the reasons tree to collect files specific to a certain
                // parent allowing us to not have to trace each parent separately
                function collectTracedFilesFromReasons(parent, files = new Set()) {
                    fileList.forEach((file)=>{
                        if (files.has(file)) return;
                        // @ts-ignore
                        const reason = reasons.get(file);
                        if (((reason === null || reason === void 0 ? void 0 : reason.parents.has(parent)) || (reason === null || reason === void 0 ? void 0 : reason.parents.size) === 0) && (reason === null || reason === void 0 ? void 0 : reason.type) !== 'initial') {
                            files.add(file);
                            collectTracedFilesFromReasons(file, files);
                        }
                    });
                    return files;
                }
                finishModulesSpan.traceChild('collect-trace-files').traceAsyncFn(()=>{
                    entryPaths.forEach((entry)=>{
                        const entryName = entryNameMap.get(entry);
                        const tracedDeps = collectTracedFilesFromReasons(_path.default.relative(root, entry));
                        const curExtraEntries = additionalEntries.get(entryName);
                        if (curExtraEntries) {
                            for (const extraEntry of curExtraEntries.keys()){
                                collectTracedFilesFromReasons(_path.default.relative(root, extraEntry), tracedDeps);
                            }
                        }
                        const finalDeps = new Set();
                        tracedDeps.forEach((dep)=>{
                            finalDeps.add(_path.default.join(root, dep));
                            tracedDeps.delete(dep);
                        });
                        this.entryTraces.set(entryName, finalDeps);
                    });
                });
            }).then(()=>callback()
            , (err)=>callback(err)
            );
        });
    }
    apply(compiler) {
        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation)=>{
            const compilationSpan = _profilingPlugin.spans.get(compilation) || _profilingPlugin.spans.get(compiler);
            const traceEntrypointsPluginSpan = compilationSpan.traceChild('next-trace-entrypoint-plugin');
            traceEntrypointsPluginSpan.traceFn(()=>{
                // @ts-ignore TODO: Remove ignore when webpack 5 is stable
                compilation.hooks.processAssets.tap({
                    name: PLUGIN_NAME,
                    // @ts-ignore TODO: Remove ignore when webpack 5 is stable
                    stage: _webpack.webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE
                }, (assets)=>{
                    this.createTraceAssets(compilation, assets, traceEntrypointsPluginSpan);
                });
                let resolver = compilation.resolverFactory.get('normal');
                function getPkgName(name) {
                    const segments = name.split('/');
                    if (name[0] === '@' && segments.length > 1) return segments.length > 1 ? segments.slice(0, 2).join('/') : null;
                    return segments.length ? segments[0] : null;
                }
                const getResolve = (options)=>{
                    const curResolver = resolver.withOptions(options);
                    return (parent, request, job)=>{
                        return new Promise((resolve, reject)=>{
                            const context = _path.default.dirname(parent);
                            curResolver.resolve({
                            }, context, request, {
                                fileDependencies: compilation.fileDependencies,
                                missingDependencies: compilation.missingDependencies,
                                contextDependencies: compilation.contextDependencies
                            }, async (err, result, resContext)=>{
                                if (err) return reject(err);
                                if (!result) {
                                    return reject(new Error('module not found'));
                                }
                                try {
                                    if (result.includes('node_modules')) {
                                        let requestPath = result;
                                        if (!_path.default.isAbsolute(request) && request.includes('/') && (resContext === null || resContext === void 0 ? void 0 : resContext.descriptionFileRoot)) {
                                            var ref;
                                            requestPath = resContext.descriptionFileRoot + request.substr(((ref = getPkgName(request)) === null || ref === void 0 ? void 0 : ref.length) || 0) + _path.default.sep + 'package.json';
                                        }
                                        // the descriptionFileRoot is not set to the last used
                                        // package.json so we use nft's resolving for this
                                        // see test/integration/build-trace-extra-entries/app/node_modules/nested-structure for example
                                        const packageJsonResult = await job.getPjsonBoundary(requestPath);
                                        if (packageJsonResult) {
                                            await job.emitFile(packageJsonResult + _path.default.sep + 'package.json', 'resolve', parent);
                                        }
                                    }
                                } catch (_err) {
                                // we failed to resolve the package.json boundary,
                                // we don't block emitting the initial asset from this
                                }
                                resolve(result);
                            });
                        });
                    };
                };
                const CJS_RESOLVE_OPTIONS = {
                    ..._webpackConfig.NODE_RESOLVE_OPTIONS,
                    extensions: undefined
                };
                const ESM_RESOLVE_OPTIONS = {
                    ..._webpackConfig.NODE_ESM_RESOLVE_OPTIONS,
                    extensions: undefined
                };
                const doResolve = async (request, parent, job, isEsmRequested)=>{
                    // When in esm externals mode, and using import, we resolve with
                    // ESM resolving options.
                    const esmExternals = this.esmExternals;
                    const looseEsmExternals = this.esmExternals === 'loose';
                    const preferEsm = esmExternals && isEsmRequested;
                    const resolve = getResolve(preferEsm ? ESM_RESOLVE_OPTIONS : CJS_RESOLVE_OPTIONS);
                    // Resolve the import with the webpack provided context, this
                    // ensures we're resolving the correct version when multiple
                    // exist.
                    let res = '';
                    try {
                        res = await resolve(parent, request, job);
                    } catch (_) {
                    }
                    // If resolving fails, and we can use an alternative way
                    // try the alternative resolving options.
                    if (!res && (isEsmRequested || looseEsmExternals)) {
                        const resolveAlternative = getResolve(preferEsm ? CJS_RESOLVE_OPTIONS : ESM_RESOLVE_OPTIONS);
                        res = await resolveAlternative(parent, request, job);
                    }
                    if (!res) {
                        throw new Error(`failed to resolve ${request} from ${parent}`);
                    }
                    return res;
                };
                this.tapfinishModules(compilation, traceEntrypointsPluginSpan, doResolve);
            });
        });
    }
}
exports.TraceEntryPointsPlugin = TraceEntryPointsPlugin;

//# sourceMappingURL=next-trace-entrypoints-plugin.js.map