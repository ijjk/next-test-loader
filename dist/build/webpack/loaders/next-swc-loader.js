"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = swcLoader;
exports.raw = void 0;
var _swc = require("../../swc");
var _options = require("../../swc/options");
async function loaderTransform(parentTrace, source, inputSourceMap) {
    // Make the loader async
    const filename = this.resourcePath;
    let loaderOptions = this.getOptions() || {
    };
    const { isServer , pagesDir , hasReactRefresh , styledComponents  } = loaderOptions;
    const isPageFile = filename.startsWith(pagesDir);
    const swcOptions = (0, _options).getLoaderSWCOptions({
        pagesDir,
        filename,
        isServer: isServer,
        isPageFile,
        development: this.mode === 'development',
        hasReactRefresh,
        styledComponents
    });
    const programmaticOptions = {
        ...swcOptions,
        filename,
        inputSourceMap: inputSourceMap ? JSON.stringify(inputSourceMap) : undefined,
        // Set the default sourcemap behavior based on Webpack's mapping flag,
        sourceMaps: this.sourceMap,
        inlineSourcesContent: this.sourceMap,
        // Ensure that Webpack will get a full absolute path in the sourcemap
        // so that it can properly map the module back to its internal cached
        // modules.
        sourceFileName: filename
    };
    if (!programmaticOptions.inputSourceMap) {
        delete programmaticOptions.inputSourceMap;
    }
    // auto detect development mode
    if (this.mode && programmaticOptions.jsc && programmaticOptions.jsc.transform && programmaticOptions.jsc.transform.react && !Object.prototype.hasOwnProperty.call(programmaticOptions.jsc.transform.react, 'development')) {
        programmaticOptions.jsc.transform.react.development = this.mode === 'development';
    }
    const swcSpan = parentTrace.traceChild('next-swc-transform');
    return swcSpan.traceAsyncFn(()=>(0, _swc).transform(source, programmaticOptions).then((output)=>{
            return [
                output.code,
                output.map ? JSON.parse(output.map) : undefined
            ];
        })
    );
}
function swcLoader(inputSource, inputSourceMap) {
    const loaderSpan = this.currentTraceSpan.traceChild('next-swc-loader');
    const callback = this.async();
    loaderSpan.traceAsyncFn(()=>loaderTransform.call(this, loaderSpan, inputSource, inputSourceMap)
    ).then(([transformedSource, outputSourceMap])=>{
        callback(null, transformedSource, outputSourceMap || inputSourceMap);
    }, (err)=>{
        callback(err);
    });
}
const raw = true;
exports.raw = raw;

//# sourceMappingURL=next-swc-loader.js.map