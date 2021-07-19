#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.nextLint = void 0;
var _fs = require("fs");
var _indexJs = _interopRequireDefault(require("next/dist/compiled/arg/index.js"));
var _path = require("path");
var _chalk = _interopRequireDefault(require("chalk"));
var _constants = require("../lib/constants");
var _runLintCheck = require("../lib/eslint/runLintCheck");
var _utils = require("../server/lib/utils");
var _storage = require("../telemetry/storage");
var _config = _interopRequireDefault(require("../server/config"));
var _constants1 = require("../shared/lib/constants");
var _events = require("../telemetry/events");
var _compileError = require("../lib/compile-error");
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var ref, ref1, ref2, ref3, ref4;
const eslintOptions = (args)=>({
        overrideConfigFile: args['--config'] || null,
        extensions: (ref = args['--ext']) !== null && ref !== void 0 ? ref : [
            '.js',
            '.jsx',
            '.ts',
            '.tsx'
        ],
        resolvePluginsRelativeTo: args['--resolve-plugins-relative-to'] || null,
        rulePaths: (ref1 = args['--rulesdir']) !== null && ref1 !== void 0 ? ref1 : [],
        fix: (ref2 = args['--fix']) !== null && ref2 !== void 0 ? ref2 : false,
        fixTypes: (ref3 = args['--fix-type']) !== null && ref3 !== void 0 ? ref3 : null,
        ignorePath: args['--ignore-path'] || null,
        ignore: !Boolean(args['--no-ignore']),
        allowInlineConfig: !Boolean(args['--no-inline-config']),
        reportUnusedDisableDirectives: args['--report-unused-disable-directives'] || null,
        cache: (ref4 = args['--cache']) !== null && ref4 !== void 0 ? ref4 : false,
        cacheLocation: args['--cache-location'] || '.eslintcache',
        errorOnUnmatchedPattern: args['--error-on-unmatched-pattern'] ? Boolean(args['--error-on-unmatched-pattern']) : false
    })
;
const nextLint = (argv)=>{
    const validArgs = {
        // Types
        '--help': Boolean,
        '--base-dir': String,
        '--dir': [
            String
        ],
        // Aliases
        '-h': '--help',
        '-b': '--base-dir',
        '-d': '--dir'
    };
    const validEslintArgs = {
        // Types
        '--config': String,
        '--ext': [
            String
        ],
        '--resolve-plugins-relative-to': String,
        '--rulesdir': [
            String
        ],
        '--fix': Boolean,
        '--fix-type': [
            String
        ],
        '--ignore-path': String,
        '--no-ignore': Boolean,
        '--quiet': Boolean,
        '--max-warnings': Number,
        '--no-inline-config': Boolean,
        '--report-unused-disable-directives': String,
        '--cache': Boolean,
        '--cache-location': String,
        '--error-on-unmatched-pattern': Boolean,
        // Aliases
        '-c': '--config'
    };
    let args;
    try {
        args = (0, _indexJs).default({
            ...validArgs,
            ...validEslintArgs
        }, {
            argv
        });
    } catch (error) {
        if (error.code === 'ARG_UNKNOWN_OPTION') {
            return (0, _utils).printAndExit(error.message, 1);
        }
        throw error;
    }
    if (args['--help']) {
        (0, _utils).printAndExit(`\n      Description\n        Run ESLint on every file in specified directories. \n        If not configured, ESLint will be set up for the first time.\n\n      Usage\n        $ next lint <baseDir> [options]\n      \n      <baseDir> represents the directory of the Next.js application.\n      If no directory is provided, the current directory will be used.\n\n      Options\n        Basic configuration:\n          -h, --help                     List this help\n          -d, --dir Array                Set directory, or directories, to run ESLint - default: 'pages', 'components', and 'lib'\n          -c, --config path::String      Use this configuration file, overriding all other config options\n          --ext [String]                 Specify JavaScript file extensions - default: .js, .jsx, .ts, .tsx\n          --resolve-plugins-relative-to path::String  A folder where plugins should be resolved from, CWD by default\n\n        Specifying rules:\n          --rulesdir [path::String]      Use additional rules from this directory\n\n        Fixing problems:\n          --fix                          Automatically fix problems\n          --fix-type Array               Specify the types of fixes to apply (problem, suggestion, layout)\n\n        Ignoring files:\n          --ignore-path path::String     Specify path of ignore file\n          --no-ignore                    Disable use of ignore files and patterns\n\n        Handling warnings:\n          --quiet                        Report errors only - default: false\n          --max-warnings Int             Number of warnings to trigger nonzero exit code - default: -1\n\n        Inline configuration comments:\n          --no-inline-config             Prevent comments from changing config or rules\n          --report-unused-disable-directives  Adds reported errors for unused eslint-disable directives ("error" | "warn" | "off")\n\n        Caching:\n          --cache                        Only check changed files - default: false\n          --cache-location path::String  Path to the cache file or directory - default: .eslintcache\n        \n        Miscellaneous:\n          --error-on-unmatched-pattern   Show errors when any file patterns are unmatched - default: false\n          `, 0);
    }
    const baseDir = (0, _path).resolve(args._[0] || '.');
    // Check if the provided directory exists
    if (!(0, _fs).existsSync(baseDir)) {
        (0, _utils).printAndExit(`> No such directory exists as the project root: ${baseDir}`);
    }
    const dirs = args['--dir'];
    const lintDirs = (dirs !== null && dirs !== void 0 ? dirs : _constants.ESLINT_DEFAULT_DIRS).reduce((res, d)=>{
        const currDir = (0, _path).join(baseDir, d);
        if (!(0, _fs).existsSync(currDir)) return res;
        res.push(currDir);
        return res;
    }, []);
    const reportErrorsOnly = Boolean(args['--quiet']);
    var ref5;
    const maxWarnings = (ref5 = args['--max-warnings']) !== null && ref5 !== void 0 ? ref5 : -1;
    (0, _runLintCheck).runLintCheck(baseDir, lintDirs, false, eslintOptions(args), reportErrorsOnly, maxWarnings).then(async (lintResults)=>{
        const lintOutput = typeof lintResults === 'string' ? lintResults : lintResults === null || lintResults === void 0 ? void 0 : lintResults.output;
        if (typeof lintResults !== 'string' && (lintResults === null || lintResults === void 0 ? void 0 : lintResults.eventInfo)) {
            const conf = await (0, _config).default(_constants1.PHASE_PRODUCTION_BUILD, baseDir);
            const telemetry = new _storage.Telemetry({
                distDir: (0, _path).join(baseDir, conf.distDir)
            });
            telemetry.record((0, _events).eventLintCheckCompleted({
                ...lintResults.eventInfo,
                buildLint: false
            }));
            await telemetry.flush();
        }
        if (typeof lintResults !== 'string' && (lintResults === null || lintResults === void 0 ? void 0 : lintResults.isError) && lintOutput) {
            throw new _compileError.CompileError(lintOutput);
        }
        if (lintOutput) {
            console.log(lintOutput);
        } else {
            console.log(_chalk.default.green('✔ No ESLint warnings or errors'));
        }
    }).catch((err)=>{
        (0, _utils).printAndExit(err.message);
    });
};
exports.nextLint = nextLint;

//# sourceMappingURL=next-lint.js.map