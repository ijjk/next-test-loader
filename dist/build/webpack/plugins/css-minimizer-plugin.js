"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var _cssnanoSimple = _interopRequireDefault(require("cssnano-simple"));
var _postcssScss = _interopRequireDefault(require("next/dist/compiled/postcss-scss"));
var _postcss = _interopRequireDefault(require("postcss"));
var _webpack = require("next/dist/compiled/webpack/webpack");
var _trace = require("../../../telemetry/trace");
var _profilingPlugin = require("./profiling-plugin");
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
// https://github.com/NMFR/optimize-css-assets-webpack-plugin/blob/0a410a9bf28c7b0e81a3470a13748e68ca2f50aa/src/index.js#L20
const CSS_REGEX = /\.css(\?.*)?$/i;
class CssMinimizerPlugin {
    constructor(options){
        this.__next_css_remove = true;
        this.options = options;
    }
    optimizeAsset(file, asset) {
        const postcssOptions = {
            ...this.options.postcssOptions,
            to: file,
            from: file,
            // We don't actually add this parser to support Sass. It can also be used
            // for inline comment support. See the README:
            // https://github.com/postcss/postcss-scss/blob/master/README.md#2-inline-comments-for-postcss
            parser: _postcssScss.default
        };
        let input;
        if (postcssOptions.map && asset.sourceAndMap) {
            const { source , map  } = asset.sourceAndMap();
            input = source;
            postcssOptions.map.prev = map ? map : false;
        } else {
            input = asset.source();
        }
        return (0, _postcss).default([
            (0, _cssnanoSimple).default({
            }, _postcss.default)
        ]).process(input, postcssOptions).then((res)=>{
            if (res.map) {
                return new _webpack.sources.SourceMapSource(res.css, file, res.map.toJSON());
            } else {
                return new _webpack.sources.RawSource(res.css);
            }
        });
    }
    apply(compiler) {
        compiler.hooks.compilation.tap('CssMinimizerPlugin', (compilation)=>{
            if (_webpack.isWebpack5) {
                const cache = compilation.getCache('CssMinimizerPlugin');
                compilation.hooks.processAssets.tapPromise({
                    name: 'CssMinimizerPlugin',
                    // @ts-ignore TODO: Remove ignore when webpack 5 is stable
                    stage: _webpack.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE
                }, async (assets)=>{
                    const compilerSpan = _profilingPlugin.spans.get(compiler);
                    const cssMinimizerSpan = (0, _trace).trace('css-minimizer-plugin', compilerSpan === null || compilerSpan === void 0 ? void 0 : compilerSpan.id);
                    cssMinimizerSpan.setAttribute('webpackVersion', 5);
                    return cssMinimizerSpan.traceAsyncFn(async ()=>{
                        const files = Object.keys(assets);
                        await Promise.all(files.filter((file)=>CSS_REGEX.test(file)
                        ).map(async (file)=>{
                            const assetSpan = (0, _trace).trace('minify-css', cssMinimizerSpan.id);
                            assetSpan.setAttribute('file', file);
                            return assetSpan.traceAsyncFn(async ()=>{
                                const asset = assets[file];
                                const etag = cache.getLazyHashedEtag(asset);
                                const cachedResult = await cache.getPromise(file, etag);
                                assetSpan.setAttribute('cache', cachedResult ? 'HIT' : 'MISS');
                                if (cachedResult) {
                                    assets[file] = cachedResult;
                                    return;
                                }
                                const result = await this.optimizeAsset(file, asset);
                                await cache.storePromise(file, etag, result);
                                assets[file] = result;
                            });
                        }));
                    });
                });
                return;
            }
            compilation.hooks.optimizeChunkAssets.tapPromise('CssMinimizerPlugin', (chunks)=>{
                const compilerSpan = _profilingPlugin.spans.get(compiler);
                const cssMinimizerSpan = (0, _trace).trace('css-minimizer-plugin', compilerSpan === null || compilerSpan === void 0 ? void 0 : compilerSpan.id);
                cssMinimizerSpan.setAttribute('webpackVersion', 4);
                cssMinimizerSpan.setAttribute('compilationName', compilation.name);
                return cssMinimizerSpan.traceAsyncFn(async ()=>{
                    return await Promise.all(chunks.reduce((acc, chunk)=>acc.concat(chunk.files || [])
                    , []).filter((entry)=>CSS_REGEX.test(entry)
                    ).map(async (file)=>{
                        const assetSpan = (0, _trace).trace('minify-css', cssMinimizerSpan.id);
                        assetSpan.setAttribute('file', file);
                        return assetSpan.traceAsyncFn(async ()=>{
                            const asset = compilation.assets[file];
                            // Makes trace attributes the same as webpack 5
                            // When using webpack 4 the result is not cached
                            assetSpan.setAttribute('cache', 'MISS');
                            compilation.assets[file] = await this.optimizeAsset(file, asset);
                        });
                    }));
                });
            });
        });
    }
}
exports.CssMinimizerPlugin = CssMinimizerPlugin;

//# sourceMappingURL=css-minimizer-plugin.js.map