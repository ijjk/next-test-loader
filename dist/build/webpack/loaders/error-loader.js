"use strict";exports.__esModule=true;exports.default=void 0;var _chalk=_interopRequireDefault(require("next/dist/compiled/chalk"));var _loaderUtils=_interopRequireDefault(require("loader-utils"));var _path=_interopRequireDefault(require("path"));function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}const ErrorLoader=function(){var _this$_module$issuer$,_this$_module,_this$_module$issuer,_this$rootContext,_this$_compiler;const options=_loaderUtils.default.getOptions(this)||{};const{reason='An unknown error has occurred'}=options;const resource=(_this$_module$issuer$=(_this$_module=this._module)===null||_this$_module===void 0?void 0:(_this$_module$issuer=_this$_module.issuer)===null||_this$_module$issuer===void 0?void 0:_this$_module$issuer.resource)!==null&&_this$_module$issuer$!==void 0?_this$_module$issuer$:null;const context=(_this$rootContext=this.rootContext)!==null&&_this$rootContext!==void 0?_this$rootContext:(_this$_compiler=this._compiler)===null||_this$_compiler===void 0?void 0:_this$_compiler.context;const issuer=resource?context?_path.default.relative(context,resource):resource:null;const err=new Error(reason+(issuer?`\nLocation: ${_chalk.default.cyan(issuer)}`:''));this.emitError(err);};var _default=ErrorLoader;exports.default=_default;
//# sourceMappingURL=error-loader.js.map