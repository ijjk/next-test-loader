"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.adapter = adapter;
var _utils = require("./utils");
var _fetchEvent = require("./spec-extension/fetch-event");
var _request = require("./spec-extension/request");
var _response = require("./spec-extension/response");
var _fetchEvent1 = require("./spec-compliant/fetch-event");
async function adapter(params) {
    const url = params.request.url.startsWith('/') ? `https://${params.request.headers.host}${params.request.url}` : params.request.url;
    const event = new _fetchEvent.NextFetchEvent(new _request.NextRequest(url, {
        geo: params.request.geo,
        headers: (0, _utils).fromNodeHeaders(params.request.headers),
        ip: params.request.ip,
        method: params.request.method,
        nextConfig: params.request.nextConfig,
        page: params.request.page
    }));
    const handled = params.handler(event);
    const original = await event[_fetchEvent1.responseSymbol];
    return {
        promise: Promise.resolve(handled),
        response: original || _response.NextResponse.next(),
        waitUntil: Promise.all(event[_fetchEvent1.waitUntilSymbol])
    };
}

//# sourceMappingURL=adapter.js.map