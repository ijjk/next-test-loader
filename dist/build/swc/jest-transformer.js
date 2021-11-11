"use strict";
var _vm = _interopRequireDefault(require("vm"));
var _index = require("./index");
var _options = require("./options");
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
// Jest use the `vm` [Module API](https://nodejs.org/api/vm.html#vm_class_vm_module) for ESM.
// see https://github.com/facebook/jest/issues/9430
const isSupportEsm = 'Module' in _vm.default;
module.exports = {
    createTransformer: (inputOptions)=>({
            process (src, filename, jestOptions) {
                if (!/\.[jt]sx?$/.test(filename)) {
                    return src;
                }
                let swcTransformOpts = (0, _options).getJestSWCOptions({
                    filename,
                    styledComponents: inputOptions.styledComponents,
                    paths: inputOptions.paths,
                    baseUrl: inputOptions.resolvedBaseUrl,
                    esm: isSupportEsm && isEsm(Boolean(inputOptions.isEsmProject), filename, jestOptions)
                });
                return((0, _index).transformSync(src, {
                    ...swcTransformOpts,
                    filename
                }));
            }
        })
};
function getJestConfig(jestConfig) {
    return 'config' in jestConfig ? jestConfig.config : jestConfig;
}
function isEsm(isEsmProject, filename, jestOptions) {
    var ref;
    return /\.jsx?$/.test(filename) && isEsmProject || ((ref = getJestConfig(jestOptions).extensionsToTreatAsEsm) === null || ref === void 0 ? void 0 : ref.find((ext)=>filename.endsWith(ext)
    ));
}

//# sourceMappingURL=jest-transformer.js.map