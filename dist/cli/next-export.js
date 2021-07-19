#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.nextExport = void 0;
var _path = require("path");
var _fs = require("fs");
var _indexJs = _interopRequireDefault(require("next/dist/compiled/arg/index.js"));
var _export = _interopRequireDefault(require("../export"));
var _utils = require("../server/lib/utils");
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const nextExport = (argv)=>{
    const validArgs = {
        // Types
        '--help': Boolean,
        '--silent': Boolean,
        '--outdir': String,
        '--threads': Number,
        // Aliases
        '-h': '--help',
        '-s': '--silent',
        '-o': '--outdir'
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
        console.log(`\n      Description\n        Exports the application for production deployment\n\n      Usage\n        $ next export [options] <dir>\n\n      <dir> represents the directory of the Next.js application.\n      If no directory is provided, the current directory will be used.\n\n      Options\n        -h - list this help\n        -o - set the output dir (defaults to 'out')\n        -s - do not print any messages to console\n    `);
        process.exit(0);
    }
    const dir = (0, _path).resolve(args._[0] || '.');
    // Check if pages dir exists and warn if not
    if (!(0, _fs).existsSync(dir)) {
        (0, _utils).printAndExit(`> No such directory exists as the project root: ${dir}`);
    }
    const options = {
        silent: args['--silent'] || false,
        threads: args['--threads'],
        outdir: args['--outdir'] ? (0, _path).resolve(args['--outdir']) : (0, _path).join(dir, 'out')
    };
    (0, _export).default(dir, options).then(()=>{
        (0, _utils).printAndExit(`Export successful. Files written to ${options.outdir}`, 0);
    }).catch((err)=>{
        (0, _utils).printAndExit(err);
    });
};
exports.nextExport = nextExport;

//# sourceMappingURL=next-export.js.map