"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var _fetchEvent = require("../spec-compliant/fetch-event");
class NextFetchEvent extends _fetchEvent.FetchEvent {
    constructor(request){
        super(request);
        this.request = request;
    }
}
exports.NextFetchEvent = NextFetchEvent;

//# sourceMappingURL=fetch-event.js.map