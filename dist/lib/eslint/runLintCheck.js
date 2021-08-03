"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.runLintCheck = runLintCheck;
var _fs = require("fs");
var _chalk = _interopRequireDefault(require("chalk"));
var _path = _interopRequireDefault(require("path"));
var _findUp = _interopRequireDefault(require("next/dist/compiled/find-up"));
var _semver = _interopRequireDefault(require("next/dist/compiled/semver"));
var CommentJson = _interopRequireWildcard(require("next/dist/compiled/comment-json"));
var _customFormatter = require("./customFormatter");
var _writeDefaultConfig = require("./writeDefaultConfig");
var _findPagesDir = require("../find-pages-dir");
var _hasNecessaryDependencies = require("../has-necessary-dependencies");
var Log = _interopRequireWildcard(require("../../build/output/log"));
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
async function lint(deps, baseDir, lintDirs, eslintrcFile, pkgJsonPath, eslintOptions = null, reportErrorsOnly = false, maxWarnings = -1, formatter = null) {
    var ref;
    // Load ESLint after we're sure it exists:
    const mod = await Promise.resolve().then(function() {
        return _interopRequireWildcard(require(deps.resolved.get('eslint')));
    });
    const { ESLint  } = mod;
    let eslintVersion = ESLint === null || ESLint === void 0 ? void 0 : ESLint.version;
    if (!ESLint) {
        var ref1;
        eslintVersion = mod === null || mod === void 0 ? void 0 : (ref1 = mod.CLIEngine) === null || ref1 === void 0 ? void 0 : ref1.version;
        if (!eslintVersion || _semver.default.lt(eslintVersion, '7.0.0')) {
            return `${_chalk.default.red('error')} - Your project has an older version of ESLint installed${eslintVersion ? ' (' + eslintVersion + ')' : ''}. Please upgrade to ESLint version 7 or later`;
        }
        return `${_chalk.default.red('error')} - ESLint class not found. Please upgrade to ESLint version 7 or later`;
    }
    let options = {
        useEslintrc: true,
        baseConfig: {
        },
        errorOnUnmatchedPattern: false,
        extensions: [
            '.js',
            '.jsx',
            '.ts',
            '.tsx'
        ],
        ...eslintOptions
    };
    let eslint = new ESLint(options);
    let nextEslintPluginIsEnabled = false;
    const pagesDirRules = [
        '@next/next/no-html-link-for-pages'
    ];
    for (const configFile of [
        eslintrcFile,
        pkgJsonPath
    ]){
        var ref2;
        if (!configFile) continue;
        const completeConfig = await eslint.calculateConfigForFile(configFile);
        if ((ref2 = completeConfig.plugins) === null || ref2 === void 0 ? void 0 : ref2.includes('@next/next')) {
            nextEslintPluginIsEnabled = true;
            break;
        }
    }
    const pagesDir = (0, _findPagesDir).findPagesDir(baseDir);
    if (nextEslintPluginIsEnabled) {
        let updatedPagesDir = false;
        for (const rule of pagesDirRules){
            var ref3, ref4;
            if (!((ref3 = options.baseConfig.rules) === null || ref3 === void 0 ? void 0 : ref3[rule]) && !((ref4 = options.baseConfig.rules) === null || ref4 === void 0 ? void 0 : ref4[rule.replace('@next/next', '@next/babel-plugin-next')])) {
                if (!options.baseConfig.rules) {
                    options.baseConfig.rules = {
                    };
                }
                options.baseConfig.rules[rule] = [
                    1,
                    pagesDir
                ];
                updatedPagesDir = true;
            }
        }
        if (updatedPagesDir) {
            eslint = new ESLint(options);
        }
    }
    const lintStart = process.hrtime();
    let results = await eslint.lintFiles(lintDirs);
    let selectedFormatter = null;
    if (options.fix) await ESLint.outputFixes(results);
    if (reportErrorsOnly) results = await ESLint.getErrorResults(results) // Only return errors if --quiet flag is used
    ;
    if (formatter) selectedFormatter = await eslint.loadFormatter(formatter);
    const formattedResult = (0, _customFormatter).formatResults(baseDir, results, selectedFormatter === null || selectedFormatter === void 0 ? void 0 : selectedFormatter.format);
    const lintEnd = process.hrtime(lintStart);
    const totalWarnings = results.reduce((sum, file)=>sum + file.warningCount
    , 0);
    return {
        output: formattedResult.output,
        isError: ((ref = ESLint.getErrorResults(results)) === null || ref === void 0 ? void 0 : ref.length) > 0 || maxWarnings >= 0 && totalWarnings > maxWarnings,
        eventInfo: {
            durationInSeconds: lintEnd[0],
            eslintVersion: eslintVersion,
            lintedFilesCount: results.length,
            lintFix: !!options.fix,
            nextEslintPluginVersion: nextEslintPluginIsEnabled ? require(_path.default.join(_path.default.dirname(deps.resolved.get('eslint-config-next')), 'package.json')).version : null,
            nextEslintPluginErrorsCount: formattedResult.totalNextPluginErrorCount,
            nextEslintPluginWarningsCount: formattedResult.totalNextPluginWarningCount
        }
    };
}
async function runLintCheck(baseDir, lintDirs, lintDuringBuild = false, eslintOptions = null, reportErrorsOnly = false, maxWarnings = -1, formatter = null) {
    try {
        var ref5;
        // Find user's .eslintrc file
        const eslintrcFile = (ref5 = await (0, _findUp).default([
            '.eslintrc.js',
            '.eslintrc.yaml',
            '.eslintrc.yml',
            '.eslintrc.json',
            '.eslintrc', 
        ], {
            cwd: baseDir
        })) !== null && ref5 !== void 0 ? ref5 : null;
        var ref6;
        const pkgJsonPath = (ref6 = await (0, _findUp).default('package.json', {
            cwd: baseDir
        })) !== null && ref6 !== void 0 ? ref6 : null;
        let packageJsonConfig = null;
        if (pkgJsonPath) {
            const pkgJsonContent = await _fs.promises.readFile(pkgJsonPath, {
                encoding: 'utf8'
            });
            packageJsonConfig = CommentJson.parse(pkgJsonContent);
        }
        // Warning displayed if no ESLint configuration is present during build
        if (lintDuringBuild && !eslintrcFile && !packageJsonConfig.eslintConfig) {
            Log.warn(`No ESLint configuration detected. Run ${_chalk.default.bold.cyan('next lint')} to begin setup`);
            return null;
        }
        // Ensure ESLint and necessary plugins and configs are installed:
        const deps = await (0, _hasNecessaryDependencies).hasNecessaryDependencies(baseDir, false, true, lintDuringBuild);
        // Write default ESLint config if none is present
        // Check for /pages and src/pages is to make sure this happens in Next.js folder
        if ((0, _findPagesDir).existsSync(_path.default.join(baseDir, 'pages')) || (0, _findPagesDir).existsSync(_path.default.join(baseDir, 'src/pages'))) {
            await (0, _writeDefaultConfig).writeDefaultConfig(eslintrcFile, pkgJsonPath, packageJsonConfig);
        }
        // Run ESLint
        return await lint(deps, baseDir, lintDirs, eslintrcFile, pkgJsonPath, eslintOptions, reportErrorsOnly, maxWarnings, formatter);
    } catch (err) {
        throw err;
    }
}

//# sourceMappingURL=runLintCheck.js.map