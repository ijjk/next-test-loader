"use strict";
var _loaderUtils = _interopRequireDefault(require("next/dist/compiled/loader-utils"));
var _path = _interopRequireDefault(require("path"));
var _schemaUtils3 = require("next/dist/compiled/schema-utils3");
var _isEqualLocals = _interopRequireDefault(require("./runtime/isEqualLocals"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const schema = {
    type: 'object',
    properties: {
        injectType: {
            description: 'Allows to setup how styles will be injected into DOM (https://github.com/webpack-contrib/style-loader#injecttype).',
            enum: [
                'styleTag',
                'singletonStyleTag',
                'lazyStyleTag',
                'lazySingletonStyleTag',
                'linkTag', 
            ]
        },
        attributes: {
            description: 'Adds custom attributes to tag (https://github.com/webpack-contrib/style-loader#attributes).',
            type: 'object'
        },
        insert: {
            description: 'Inserts `<style>`/`<link>` at the given position (https://github.com/webpack-contrib/style-loader#insert).',
            anyOf: [
                {
                    type: 'string'
                },
                {
                    instanceof: 'Function'
                }, 
            ]
        },
        base: {
            description: 'Sets module ID base for DLLPlugin (https://github.com/webpack-contrib/style-loader#base).',
            type: 'number'
        },
        esModule: {
            description: 'Use the ES modules syntax (https://github.com/webpack-contrib/css-loader#esmodule).',
            type: 'boolean'
        }
    },
    additionalProperties: false
};
const loaderApi = ()=>{
};
loaderApi.pitch = function loader(request) {
    const options = _loaderUtils.default.getOptions(this);
    (0, _schemaUtils3).validate(schema, options, {
        name: 'Style Loader',
        baseDataPath: 'options'
    });
    const insert = typeof options.insert === 'undefined' ? '"head"' : typeof options.insert === 'string' ? JSON.stringify(options.insert) : options.insert.toString();
    const injectType = options.injectType || 'styleTag';
    const esModule = typeof options.esModule !== 'undefined' ? options.esModule : false;
    delete options.esModule;
    switch(injectType){
        case 'linkTag':
            {
                const hmrCode = this.hot ? `\nif (module.hot) {\n  module.hot.accept(\n    ${_loaderUtils.default.stringifyRequest(this, `!!${request}`)},\n    function() {\n     ${esModule ? 'update(content);' : `content = require(${_loaderUtils.default.stringifyRequest(this, `!!${request}`)});\n\n           content = content.__esModule ? content.default : content;\n\n           update(content);`}\n    }\n  );\n\n  module.hot.dispose(function() {\n    update();\n  });\n}` : '';
                return `${esModule ? `import api from ${_loaderUtils.default.stringifyRequest(this, `!${_path.default.join(__dirname, 'runtime/injectStylesIntoLinkTag.js')}`)};\n            import content from ${_loaderUtils.default.stringifyRequest(this, `!!${request}`)};` : `var api = require(${_loaderUtils.default.stringifyRequest(this, `!${_path.default.join(__dirname, 'runtime/injectStylesIntoLinkTag.js')}`)});\n            var content = require(${_loaderUtils.default.stringifyRequest(this, `!!${request}`)});\n\n            content = content.__esModule ? content.default : content;`}\n\nvar options = ${JSON.stringify(options)};\n\noptions.insert = ${insert};\n\nvar update = api(content, options);\n\n${hmrCode}\n\n${esModule ? 'export default {}' : ''}`;
            }
        case 'lazyStyleTag':
        case 'lazySingletonStyleTag':
            {
                const isSingleton = injectType === 'lazySingletonStyleTag';
                const hmrCode = this.hot ? `\nif (module.hot) {\n  if (!content.locals || module.hot.invalidate) {\n    var isEqualLocals = ${_isEqualLocals.default.toString()};\n    var oldLocals = content.locals;\n\n    module.hot.accept(\n      ${_loaderUtils.default.stringifyRequest(this, `!!${request}`)},\n      function () {\n        ${esModule ? `if (!isEqualLocals(oldLocals, content.locals)) {\n                module.hot.invalidate();\n\n                return;\n              }\n\n              oldLocals = content.locals;\n\n              if (update && refs > 0) {\n                update(content);\n              }` : `content = require(${_loaderUtils.default.stringifyRequest(this, `!!${request}`)});\n\n              content = content.__esModule ? content.default : content;\n\n              if (!isEqualLocals(oldLocals, content.locals)) {\n                module.hot.invalidate();\n\n                return;\n              }\n\n              oldLocals = content.locals;\n\n              if (update && refs > 0) {\n                update(content);\n              }`}\n      }\n    )\n  }\n\n  module.hot.dispose(function() {\n    if (update) {\n      update();\n    }\n  });\n}` : '';
                return `${esModule ? `import api from ${_loaderUtils.default.stringifyRequest(this, `!${_path.default.join(__dirname, 'runtime/injectStylesIntoStyleTag.js')}`)};\n            import content from ${_loaderUtils.default.stringifyRequest(this, `!!${request}`)};` : `var api = require(${_loaderUtils.default.stringifyRequest(this, `!${_path.default.join(__dirname, 'runtime/injectStylesIntoStyleTag.js')}`)});\n            var content = require(${_loaderUtils.default.stringifyRequest(this, `!!${request}`)});\n\n            content = content.__esModule ? content.default : content;\n\n            if (typeof content === 'string') {\n              content = [[module.id, content, '']];\n            }`}\n\nvar refs = 0;\nvar update;\nvar options = ${JSON.stringify(options)};\n\noptions.insert = ${insert};\noptions.singleton = ${isSingleton};\n\nvar exported = {};\n\nexported.locals = content.locals || {};\nexported.use = function() {\n  if (!(refs++)) {\n    update = api(content, options);\n  }\n\n  return exported;\n};\nexported.unuse = function() {\n  if (refs > 0 && !--refs) {\n    update();\n    update = null;\n  }\n};\n\n${hmrCode}\n\n${esModule ? 'export default' : 'module.exports ='} exported;`;
            }
        case 'styleTag':
        case 'singletonStyleTag':
        default:
            {
                const isSingleton = injectType === 'singletonStyleTag';
                const hmrCode = this.hot ? `\nif (module.hot) {\n  if (!content.locals || module.hot.invalidate) {\n    var isEqualLocals = ${_isEqualLocals.default.toString()};\n    var oldLocals = content.locals;\n\n    module.hot.accept(\n      ${_loaderUtils.default.stringifyRequest(this, `!!${request}`)},\n      function () {\n        ${esModule ? `if (!isEqualLocals(oldLocals, content.locals)) {\n                module.hot.invalidate();\n\n                return;\n              }\n\n              oldLocals = content.locals;\n\n              update(content);` : `content = require(${_loaderUtils.default.stringifyRequest(this, `!!${request}`)});\n\n              content = content.__esModule ? content.default : content;\n\n              if (typeof content === 'string') {\n                content = [[module.id, content, '']];\n              }\n\n              if (!isEqualLocals(oldLocals, content.locals)) {\n                module.hot.invalidate();\n\n                return;\n              }\n\n              oldLocals = content.locals;\n\n              update(content);`}\n      }\n    )\n  }\n\n  module.hot.dispose(function() {\n    update();\n  });\n}` : '';
                return `${esModule ? `import api from ${_loaderUtils.default.stringifyRequest(this, `!${_path.default.join(__dirname, 'runtime/injectStylesIntoStyleTag.js')}`)};\n            import content from ${_loaderUtils.default.stringifyRequest(this, `!!${request}`)};` : `var api = require(${_loaderUtils.default.stringifyRequest(this, `!${_path.default.join(__dirname, 'runtime/injectStylesIntoStyleTag.js')}`)});\n            var content = require(${_loaderUtils.default.stringifyRequest(this, `!!${request}`)});\n\n            content = content.__esModule ? content.default : content;\n\n            if (typeof content === 'string') {\n              content = [[module.id, content, '']];\n            }`}\n\nvar options = ${JSON.stringify(options)};\n\noptions.insert = ${insert};\noptions.singleton = ${isSingleton};\n\nvar update = api(content, options);\n\n${hmrCode}\n\n${esModule ? 'export default' : 'module.exports ='} content.locals || {};`;
            }
    }
};
module.exports = loaderApi;

//# sourceMappingURL=index.js.map