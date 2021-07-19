#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.nextBuild = void 0;
var _fs = require("fs");
var _indexJs = _interopRequireDefault(require("next/dist/compiled/arg/index.js"));
var _path = require("path");
var Log = _interopRequireWildcard(require("../build/output/log"));
var _build = _interopRequireDefault(require("../build"));
var _utils = require("../server/lib/utils");
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
        return obj;
    } else {
        var newObj = {
        };
        if (obj != null) {
            for(var key in obj){
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {
                    };
                    if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                    } else {
                        newObj[key] = obj[key];
                    }
                }
            }
        }
        newObj.default = obj;
        return newObj;
    }
}
const nextBuild = (argv)=>{
    const validArgs = {
        // Types
        '--help': Boolean,
        '--profile': Boolean,
        '--debug': Boolean,
        '--no-lint': Boolean,
        // Aliases
        '-h': '--help',
        '-d': '--debug'
    };
    let args;
    try {
        args = (0, _indexJs).default(validArgs, {
            argv
        });
    } catch (error) {
        if (error.code === 'ARG_UNKNOWN_OPTION') {
            return (0, _utils).printAndExit(error.message, 1);
        }
        throw error;
    }
    if (args['--help']) {
        (0, _utils).printAndExit(`\n      Description\n        Compiles the application for production deployment\n\n      Usage\n        $ next build <dir>\n\n      <dir> represents the directory of the Next.js application.\n      If no directory is provided, the current directory will be used.\n\n      Options\n      --profile     Can be used to enable React Production Profiling\n      --no-lint     Disable linting\n    `, 0);
    }
    if (args['--profile']) {
        Log.warn('Profiling is enabled. Note: This may affect performance');
    }
    if (args['--no-lint']) {
        Log.warn('Linting is disabled');
    }
    const dir = (0, _path).resolve(args._[0] || '.');
    // Check if the provided directory exists
    if (!(0, _fs).existsSync(dir)) {
        (0, _utils).printAndExit(`> No such directory exists as the project root: ${dir}`);
    }
    return (0, _build).default(dir, null, args['--profile'], args['--debug'], !args['--no-lint']).catch((err)=>{
        console.error('');
        console.error('> Build error occurred');
        (0, _utils).printAndExit(err);
    });
};
exports.nextBuild = nextBuild;

//# sourceMappingURL=next-build.js.map