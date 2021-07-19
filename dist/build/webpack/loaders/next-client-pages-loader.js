"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = void 0;
var _loaderUtils = _interopRequireDefault(require("next/dist/compiled/loader-utils"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
// this parameter: https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters
function nextClientPagesLoader() {
    const pagesLoaderSpan = this.currentTraceSpan.traceChild('next-client-pages-loader');
    return pagesLoaderSpan.traceFn(()=>{
        const { absolutePagePath , page  } = _loaderUtils.default.getOptions(this);
        pagesLoaderSpan.setAttribute('absolutePagePath', absolutePagePath);
        const stringifiedAbsolutePagePath = JSON.stringify(absolutePagePath);
        const stringifiedPage = JSON.stringify(page);
        return `\n    (window.__NEXT_P = window.__NEXT_P || []).push([\n      ${stringifiedPage},\n      function () {\n        return require(${stringifiedAbsolutePagePath});\n      }\n    ]);\n  `;
    });
}
var _default = nextClientPagesLoader;
exports.default = _default;

//# sourceMappingURL=next-client-pages-loader.js.map