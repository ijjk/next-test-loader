"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.spans = void 0;
var _webpack = require("next/dist/compiled/webpack/webpack");
var _trace = require("../../../telemetry/trace");
const pluginName = 'ProfilingPlugin';
const spans = new WeakMap();
exports.spans = spans;
function getNormalModuleLoaderHook(compilation) {
    if (_webpack.isWebpack5) {
        // @ts-ignore TODO: Remove ignore when webpack 5 is stable
        return _webpack.webpack.NormalModule.getCompilationHooks(compilation).loader;
    }
    return compilation.hooks.normalModuleLoader;
}
class ProfilingPlugin {
    apply(compiler) {
        this.traceTopLevelHooks(compiler);
        this.traceCompilationHooks(compiler);
        this.compiler = compiler;
    }
    traceHookPair(spanName, startHook, stopHook, attrs, onSetSpan) {
        let span;
        startHook.tap(pluginName, ()=>{
            span = (0, _trace).stackPush(this.compiler, spanName, attrs);
            onSetSpan === null || onSetSpan === void 0 ? void 0 : onSetSpan(span);
        });
        stopHook.tap(pluginName, ()=>{
            // `stopHook` may be triggered when `startHook` has not in cases
            // where `stopHook` is used as the terminating event for more
            // than one pair of hooks.
            if (!span) {
                return;
            }
            (0, _trace).stackPop(this.compiler, span);
        });
    }
    traceLoopedHook(spanName, startHook, stopHook) {
        let span;
        startHook.tap(pluginName, ()=>{
            if (!span) {
                span = (0, _trace).stackPush(this.compiler, spanName);
            }
        });
        stopHook.tap(pluginName, ()=>{
            (0, _trace).stackPop(this.compiler, span);
        });
    }
    traceTopLevelHooks(compiler) {
        this.traceHookPair('webpack-compile', compiler.hooks.compile, compiler.hooks.done, ()=>{
            return {
                name: compiler.name
            };
        }, (span)=>spans.set(compiler, span)
        );
        this.traceHookPair('webpack-prepare-env', compiler.hooks.environment, compiler.hooks.afterEnvironment);
        if (compiler.options.mode === 'development') {
            this.traceHookPair('webpack-invalidated', compiler.hooks.invalid, compiler.hooks.done, ()=>({
                    name: compiler.name
                })
            );
        }
    }
    traceCompilationHooks(compiler) {
        if (_webpack.isWebpack5) {
            this.traceHookPair('webpack-compilation', compiler.hooks.beforeCompile, compiler.hooks.afterCompile, ()=>({
                    name: compiler.name
                })
            );
        }
        compiler.hooks.compilation.tap(pluginName, (compilation)=>{
            compilation.hooks.buildModule.tap(pluginName, (module)=>{
                const compilerSpan = spans.get(compiler);
                if (!compilerSpan) {
                    return;
                }
                const span = (0, _trace).trace('build-module', compilerSpan.id);
                span.setAttribute('name', module.userRequest);
                spans.set(module, span);
            });
            getNormalModuleLoaderHook(compilation).tap(pluginName, (loaderContext, module)=>{
                const parentSpan = spans.get(module);
                loaderContext.currentTraceSpan = parentSpan;
            });
            compilation.hooks.succeedModule.tap(pluginName, (module)=>{
                var ref;
                (ref = spans.get(module)) === null || ref === void 0 ? void 0 : ref.stop();
            });
            this.traceHookPair('webpack-compilation-chunk-graph', compilation.hooks.beforeChunks, compilation.hooks.afterChunks);
            this.traceHookPair('webpack-compilation-optimize', compilation.hooks.optimize, compilation.hooks.reviveModules);
            this.traceLoopedHook('webpack-compilation-optimize-modules', compilation.hooks.optimizeModules, compilation.hooks.afterOptimizeModules);
            this.traceLoopedHook('webpack-compilation-optimize-chunks', compilation.hooks.optimizeChunks, compilation.hooks.afterOptimizeChunks);
            this.traceHookPair('webpack-compilation-optimize-tree', compilation.hooks.optimizeTree, compilation.hooks.afterOptimizeTree);
            this.traceHookPair('webpack-compilation-hash', compilation.hooks.beforeHash, compilation.hooks.afterHash);
        });
    }
}
exports.ProfilingPlugin = ProfilingPlugin;

//# sourceMappingURL=profiling-plugin.js.map