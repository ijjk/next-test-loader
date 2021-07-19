"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.loadStaticPaths = loadStaticPaths;
var _utils = require("../../build/utils");
var _loadComponents = require("../load-components");
require("../node-polyfill-fetch");
let workerWasUsed = false;
async function loadStaticPaths(distDir, pathname, serverless, config, locales, defaultLocale) {
    // we only want to use each worker once to prevent any invalid
    // caches
    if (workerWasUsed) {
        process.exit(1);
    }
    // update work memory runtime-config
    require('../../shared/lib/runtime-config').setConfig(config);
    const components = await (0, _loadComponents).loadComponents(distDir, pathname, serverless);
    if (!components.getStaticPaths) {
        // we shouldn't get to this point since the worker should
        // only be called for SSG pages with getStaticPaths
        throw new Error(`Invariant: failed to load page with getStaticPaths for ${pathname}`);
    }
    workerWasUsed = true;
    return (0, _utils).buildStaticPaths(pathname, components.getStaticPaths, locales, defaultLocale);
}

//# sourceMappingURL=static-paths-worker.js.map