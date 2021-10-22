"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.streamToIterator = streamToIterator;
exports.notImplemented = notImplemented;
exports.fromNodeHeaders = fromNodeHeaders;
exports.toNodeHeaders = toNodeHeaders;
async function* streamToIterator(readable) {
    const reader = readable.getReader();
    while(true){
        const { value , done  } = await reader.read();
        if (done) break;
        if (value) {
            yield value;
        }
    }
    reader.releaseLock();
}
function notImplemented(name, method) {
    throw new Error(`Failed to get the '${method}' property on '${name}': the property is not implemented`);
}
function fromNodeHeaders(object) {
    const headers = {
    };
    for(let headerKey in object){
        const headerValue = object[headerKey];
        if (Array.isArray(headerValue)) {
            headers[headerKey] = headerValue.join('; ');
        } else if (headerValue) {
            headers[headerKey] = String(headerValue);
        }
    }
    return headers;
}
function toNodeHeaders(headers) {
    const object = {
    };
    if (headers) {
        for (const [key, value] of headers.entries()){
            object[key] = value.includes(';') ? value.split(';') : value;
        }
    }
    return object;
}

//# sourceMappingURL=utils.js.map