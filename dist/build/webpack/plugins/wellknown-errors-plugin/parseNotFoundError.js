"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getNotFoundError = getNotFoundError;
var _chalk = _interopRequireDefault(require("chalk"));
var _simpleWebpackError = require("./simpleWebpackError");
var _middleware = require("@next/react-dev-overlay/lib/middleware");
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const chalk = new _chalk.default.constructor({
    enabled: true
});
async function getNotFoundError(compilation, input, fileName) {
    if (input.name !== 'ModuleNotFoundError') {
        return false;
    }
    const loc = input.loc ? input.loc : input.dependencies.map((d)=>d.loc
    ).filter(Boolean)[0];
    const originalSource = input.module.originalSource();
    try {
        var ref, ref1;
        const result = await (0, _middleware).createOriginalStackFrame({
            line: loc.start.line,
            column: loc.start.column,
            source: originalSource,
            rootDirectory: compilation.options.context,
            frame: {
            }
        });
        // If we could not result the original location we still need to show the existing error
        if (!result) {
            return input;
        }
        const errorMessage = input.error.message.replace(/ in '.*?'/, '').replace(/Can't resolve '(.*)'/, `Can't resolve '${chalk.green('$1')}'`);
        const message = chalk.red.bold('Module not found') + `: ${errorMessage}` + '\n' + result.originalCodeFrame;
        var ref2, ref3;
        return new _simpleWebpackError.SimpleWebpackError(`${chalk.cyan(fileName)}:${chalk.yellow((ref2 = (ref = result.originalStackFrame.lineNumber) === null || ref === void 0 ? void 0 : ref.toString()) !== null && ref2 !== void 0 ? ref2 : '')}:${chalk.yellow((ref3 = (ref1 = result.originalStackFrame.column) === null || ref1 === void 0 ? void 0 : ref1.toString()) !== null && ref3 !== void 0 ? ref3 : '')}`, message);
    } catch (err) {
        console.log('Failed to parse source map:', err);
        // Don't fail on failure to resolve sourcemaps
        return input;
    }
}

//# sourceMappingURL=parseNotFoundError.js.map