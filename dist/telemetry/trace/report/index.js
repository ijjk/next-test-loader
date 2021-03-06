"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.report = void 0;
var _shared = require("../shared");
var _toConsole = _interopRequireDefault(require("./to-console"));
var _toZipkin = _interopRequireDefault(require("./to-zipkin"));
var _toTelemetry = _interopRequireDefault(require("./to-telemetry"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const target = process.env.TRACE_TARGET && process.env.TRACE_TARGET in _shared.TARGET ? _shared.TARGET[process.env.TRACE_TARGET] : _shared.TARGET.TELEMETRY;
if (process.env.TRACE_TARGET && !target) {
    console.info('For TRACE_TARGET, please specify one of: CONSOLE, ZIPKIN, TELEMETRY');
}
let report;
exports.report = report;
if (target === _shared.TARGET.CONSOLE) {
    exports.report = report = _toConsole.default;
} else if (target === _shared.TARGET.ZIPKIN) {
    exports.report = report = _toZipkin.default;
} else {
    exports.report = report = _toTelemetry.default;
}

//# sourceMappingURL=index.js.map