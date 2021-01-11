"use strict";exports.__esModule=true;exports.NextJsRequireCacheHotReloader=void 0;var _webpack=require("webpack");var _fs=require("fs");var _path=_interopRequireDefault(require("path"));function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}const isWebpack5=parseInt(_webpack.version)===5;function deleteCache(filePath){try{delete require.cache[(0,_fs.realpathSync)(filePath)];}catch(e){if(e.code!=='ENOENT')throw e;}finally{delete require.cache[filePath];}}const PLUGIN_NAME='NextJsRequireCacheHotReloader';// This plugin flushes require.cache after emitting the files. Providing 'hot reloading' of server files.
class NextJsRequireCacheHotReloader{constructor(){this.prevAssets=null;this.previousOutputPathsWebpack5=new Set();this.currentOutputPathsWebpack5=new Set();}apply(compiler){if(isWebpack5){// @ts-ignored Webpack has this hooks
compiler.hooks.assetEmitted.tap(PLUGIN_NAME,(_file,{targetPath})=>{this.currentOutputPathsWebpack5.add(targetPath);deleteCache(targetPath);});compiler.hooks.afterEmit.tap(PLUGIN_NAME,compilation=>{const runtimeChunkPath=_path.default.join(compilation.outputOptions.path,'webpack-runtime.js');deleteCache(runtimeChunkPath);// we need to make sure to clear all server entries from cache
// since they can have a stale webpack-runtime cache
// which needs to always be in-sync
const entries=[...compilation.entries.keys()].filter(entry=>entry.toString().startsWith('pages/'));entries.forEach(page=>{const outputPath=_path.default.join(compilation.outputOptions.path,page+'.js');deleteCache(outputPath);});});this.previousOutputPathsWebpack5=new Set(this.currentOutputPathsWebpack5);this.currentOutputPathsWebpack5.clear();return;}compiler.hooks.afterEmit.tapAsync(PLUGIN_NAME,(compilation,callback)=>{const{assets}=compilation;if(this.prevAssets){for(const f of Object.keys(assets)){deleteCache(assets[f].existsAt);}for(const f of Object.keys(this.prevAssets)){if(!assets[f]){deleteCache(this.prevAssets[f].existsAt);}}}this.prevAssets=assets;callback();});}}exports.NextJsRequireCacheHotReloader=NextJsRequireCacheHotReloader;
//# sourceMappingURL=nextjs-require-cache-hot-reloader.js.map