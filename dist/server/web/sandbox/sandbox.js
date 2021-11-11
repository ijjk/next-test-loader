"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.clearSandboxCache = clearSandboxCache;
exports.run = run;
var _formdataNode = require("next/dist/compiled/formdata-node");
var _path = require("path");
var _fs = require("fs");
var _webStreamsPolyfill = require("next/dist/compiled/web-streams-polyfill");
var polyfills = _interopRequireWildcard(require("./polyfills"));
var _cookie = _interopRequireDefault(require("next/dist/compiled/cookie"));
var _vm = _interopRequireDefault(require("vm"));
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
let cache;
const WEBPACK_HASH_REGEX = /__webpack_require__\.h = function\(\) \{ return "[0-9a-f]+"; \}/g;
function clearSandboxCache(path, content) {
    var ref;
    const prev = (ref = cache === null || cache === void 0 ? void 0 : cache.paths.get(path)) === null || ref === void 0 ? void 0 : ref.replace(WEBPACK_HASH_REGEX, '');
    if (prev === undefined) return;
    if (prev === content.toString().replace(WEBPACK_HASH_REGEX, '')) return;
    cache = undefined;
}
async function run(params) {
    if (cache === undefined) {
        const context = {
            __next_eval__,
            _ENTRIES: {
            },
            atob: polyfills.atob,
            Blob: _formdataNode.Blob,
            btoa: polyfills.btoa,
            clearInterval,
            clearTimeout,
            console: {
                assert: console.assert.bind(console),
                error: console.error.bind(console),
                info: console.info.bind(console),
                log: console.log.bind(console),
                time: console.time.bind(console),
                timeEnd: console.timeEnd.bind(console),
                timeLog: console.timeLog.bind(console),
                warn: console.warn.bind(console)
            },
            CryptoKey: polyfills.CryptoKey,
            Crypto: polyfills.Crypto,
            crypto: new polyfills.Crypto(),
            fetch: (input, init = {
            })=>{
                const url = getFetchURL(input, params.request.headers);
                init.headers = getFetchHeaders(params.name, init);
                if (isRequestLike(input)) {
                    return fetch(url, {
                        ...init,
                        headers: {
                            ...Object.fromEntries(input.headers),
                            ...Object.fromEntries(init.headers)
                        }
                    });
                }
                return fetch(url, init);
            },
            File: _formdataNode.File,
            FormData: _formdataNode.FormData,
            process: {
                env: {
                    ...process.env
                }
            },
            ReadableStream: polyfills.ReadableStream,
            setInterval,
            setTimeout,
            TextDecoder: polyfills.TextDecoder,
            TextEncoder: polyfills.TextEncoder,
            TransformStream: _webStreamsPolyfill.TransformStream,
            URL,
            URLSearchParams,
            // Indexed collections
            Array,
            Int8Array,
            Uint8Array,
            Uint8ClampedArray,
            Int16Array,
            Uint16Array,
            Int32Array,
            Uint32Array,
            Float32Array,
            Float64Array,
            BigInt64Array,
            BigUint64Array,
            // Keyed collections
            Map,
            Set,
            WeakMap,
            WeakSet,
            // Structured data
            ArrayBuffer,
            SharedArrayBuffer
        };
        context.self = context;
        context.globalThis = context;
        cache = {
            context,
            onWarning: params.onWarning,
            paths: new Map(),
            require: new Map([
                [
                    require.resolve('next/dist/compiled/cookie'),
                    {
                        exports: _cookie.default
                    }
                ], 
            ]),
            sandbox: _vm.default.createContext(context, {
                codeGeneration: process.env.NODE_ENV === 'production' ? {
                    strings: false,
                    wasm: false
                } : undefined
            }),
            warnedEvals: new Set()
        };
        loadDependencies(cache.sandbox, [
            {
                path: require.resolve('../spec-compliant/headers'),
                map: {
                    Headers: 'Headers'
                }
            },
            {
                path: require.resolve('../spec-compliant/response'),
                map: {
                    Response: 'Response'
                }
            },
            {
                path: require.resolve('../spec-compliant/request'),
                map: {
                    Request: 'Request'
                }
            }, 
        ]);
    } else {
        cache.onWarning = params.onWarning;
    }
    for (const paramPath of params.paths){
        if (!cache.paths.has(paramPath)) {
            const content = (0, _fs).readFileSync(paramPath, 'utf-8');
            try {
                _vm.default.runInNewContext(content, cache.sandbox, {
                    filename: paramPath
                });
                cache.paths.set(paramPath, content);
            } catch (error) {
                cache = undefined;
                throw error;
            }
        }
    }
    const entryPoint = cache.context._ENTRIES[`middleware_${params.name}`];
    if (params.ssr) {
        cache = undefined;
        if (entryPoint) {
            return entryPoint.default({
                request: params.request
            });
        }
    }
    return entryPoint.default({
        request: params.request
    });
}
function loadDependencies(ctx, dependencies) {
    for (const { path , map  } of dependencies){
        const mod = sandboxRequire(path, path);
        for (const mapKey of Object.keys(map)){
            ctx[map[mapKey]] = mod[mapKey];
        }
    }
}
function sandboxRequire(referrer, specifier) {
    const resolved = require.resolve(specifier, {
        paths: [
            (0, _path).dirname(referrer)
        ]
    });
    const cached = cache === null || cache === void 0 ? void 0 : cache.require.get(resolved);
    if (cached !== undefined) {
        return cached.exports;
    }
    const module = {
        exports: {
        },
        loaded: false,
        id: resolved
    };
    cache === null || cache === void 0 ? void 0 : cache.require.set(resolved, module);
    const fn = _vm.default.runInContext(`(function(module,exports,require,__dirname,__filename) {${(0, _fs).readFileSync(resolved, 'utf-8')}\n})`, cache.sandbox);
    try {
        fn(module, module.exports, sandboxRequire.bind(null, resolved), (0, _path).dirname(resolved), resolved);
    } finally{
        cache === null || cache === void 0 ? void 0 : cache.require.delete(resolved);
    }
    module.loaded = true;
    return module.exports;
}
function getFetchHeaders(middleware, init) {
    var _headers;
    const headers = new Headers((_headers = init.headers) !== null && _headers !== void 0 ? _headers : {
    });
    const prevsub = headers.get(`x-middleware-subrequest`) || '';
    const value = prevsub.split(':').concat(middleware).join(':');
    headers.set(`x-middleware-subrequest`, value);
    headers.set(`user-agent`, `Next.js Middleware`);
    return headers;
}
function getFetchURL(input, headers = {
}) {
    const initurl = isRequestLike(input) ? input.url : input;
    if (initurl.startsWith('/')) {
        var ref;
        const host = (ref = headers.host) === null || ref === void 0 ? void 0 : ref.toString();
        const localhost = host === '127.0.0.1' || host === 'localhost' || (host === null || host === void 0 ? void 0 : host.startsWith('localhost:'));
        return `${localhost ? 'http' : 'https'}://${host}${initurl}`;
    }
    return initurl;
}
function isRequestLike(obj) {
    return Boolean(obj && typeof obj === 'object' && 'url' in obj);
}
function __next_eval__(fn) {
    const key = fn.toString();
    if (!(cache === null || cache === void 0 ? void 0 : cache.warnedEvals.has(key))) {
        const warning = new Error(`Dynamic Code Evaluation (e. g. 'eval', 'new Function') not allowed in Middleware`);
        warning.name = 'DynamicCodeEvaluationWarning';
        Error.captureStackTrace(warning, __next_eval__);
        cache === null || cache === void 0 ? void 0 : cache.warnedEvals.add(key);
        cache === null || cache === void 0 ? void 0 : cache.onWarning(warning);
    }
    return fn();
}

//# sourceMappingURL=sandbox.js.map