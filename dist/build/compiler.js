"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.runCompiler = runCompiler;
var _webpack = require("next/dist/compiled/webpack/webpack");
function generateStats(result, stat) {
    const { errors , warnings  } = stat.toJson('errors-warnings');
    if (errors.length > 0) {
        result.errors.push(...errors);
    }
    if (warnings.length > 0) {
        result.warnings.push(...warnings);
    }
    return result;
}
// Webpack 5 requires the compiler to be closed (to save caches)
// Webpack 4 does not have this close method so in order to be backwards compatible we check if it exists
function closeCompiler(compiler) {
    return new Promise((resolve, reject)=>{
        if ('close' in compiler) {
            // @ts-ignore Close only exists on the compiler in webpack 5
            return compiler.close((err)=>err ? reject(err) : resolve()
            );
        }
        resolve();
    });
}
function runCompiler(config) {
    return new Promise((resolve, reject)=>{
        const compiler = (0, _webpack).webpack(config);
        compiler.run((err, statsOrMultiStats)=>{
            closeCompiler(compiler).then(()=>{
                if (err) {
                    const reason = err === null || err === void 0 ? void 0 : err.toString();
                    if (reason) {
                        return resolve({
                            errors: [
                                reason
                            ],
                            warnings: []
                        });
                    }
                    return reject(err);
                }
                if ('stats' in statsOrMultiStats) {
                    const result = statsOrMultiStats.stats.reduce(generateStats, {
                        errors: [],
                        warnings: []
                    });
                    return resolve(result);
                }
                const result = generateStats({
                    errors: [],
                    warnings: []
                }, statsOrMultiStats);
                return resolve(result);
            });
        });
    });
}

//# sourceMappingURL=compiler.js.map