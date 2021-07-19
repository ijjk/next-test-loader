"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = void 0;
var _loaderUtils = require("next/dist/compiled/loader-utils");
var _trace = require("../../../telemetry/trace");
var _transform = _interopRequireDefault(require("./transform"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function nextBabelLoader(parentTrace, inputSource, inputSourceMap) {
    const filename = this.resourcePath;
    const target = this.target;
    const loaderOptions = parentTrace.traceChild('get-options').traceFn(()=>(0, _loaderUtils).getOptions(this)
    );
    const loaderSpanInner = parentTrace.traceChild('next-babel-turbo-transform');
    const { code: transformedSource , map: outputSourceMap ,  } = loaderSpanInner.traceFn(()=>_transform.default.call(this, inputSource, inputSourceMap, loaderOptions, filename, target, loaderSpanInner)
    );
    return [
        transformedSource,
        outputSourceMap
    ];
}
const nextBabelLoaderOuter = function nextBabelLoaderOuter1(inputSource, inputSourceMap) {
    var ref;
    const callback = this.async();
    const loaderSpan = (0, _trace).trace('next-babel-turbo-loader', (ref = this.currentTraceSpan) === null || ref === void 0 ? void 0 : ref.id);
    loaderSpan.traceAsyncFn(()=>nextBabelLoader.call(this, loaderSpan, inputSource, inputSourceMap)
    ).then(([transformedSource, outputSourceMap])=>callback === null || callback === void 0 ? void 0 : callback(null, transformedSource, outputSourceMap || inputSourceMap)
    , (err)=>{
        callback === null || callback === void 0 ? void 0 : callback(err);
    });
};
var _default = nextBabelLoaderOuter;
exports.default = _default;

//# sourceMappingURL=index.js.map