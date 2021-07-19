"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DocumentContext = void 0;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const DocumentContext = _react.default.createContext(null);
exports.DocumentContext = DocumentContext;
if (process.env.NODE_ENV !== 'production') {
    DocumentContext.displayName = 'DocumentContext';
}

//# sourceMappingURL=document-context.js.map