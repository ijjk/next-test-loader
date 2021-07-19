"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.stackPush = stackPush;
exports.stackPop = stackPop;
var _trace = require("./trace");
var _shared = require("./shared");
const stacks = new WeakMap();
const stoppedSpansSets = new WeakMap();
function stackPush(keyObj, spanName, attrs) {
    let stack = stacks.get(keyObj);
    let span;
    if (!stack) {
        stack = [];
        stacks.set(keyObj, stack);
        span = (0, _trace).trace(spanName, undefined, attrs ? attrs() : undefined);
    } else {
        const parent = stack[stack.length - 1];
        if (parent) {
            span = (0, _trace).trace(spanName, parent.id, attrs ? attrs() : undefined);
        } else {
            span = (0, _trace).trace(spanName, undefined, attrs ? attrs() : undefined);
        }
    }
    stack.push(span);
    return span;
}
function stackPop(keyObj, span) {
    let stack = stacks.get(keyObj);
    if (!stack) {
        (0, _shared).debugLog('Attempted to pop from non-existent stack. Key reference must be bad.');
        return;
    }
    let stoppedSpans = stoppedSpansSets.get(keyObj);
    if (!stoppedSpans) {
        stoppedSpans = new Set();
        stoppedSpansSets.set(keyObj, stoppedSpans);
    }
    if (stoppedSpans.has(span)) {
        (0, _shared).debugLog(`Attempted to terminate tracing span that was already stopped for ${span.name}`);
        return;
    }
    while(true){
        let poppedSpan = stack.pop();
        if (poppedSpan && poppedSpan === span) {
            stoppedSpans.add(poppedSpan);
            span.stop();
            stoppedSpans.add(span);
            break;
        } else if (poppedSpan === undefined || stack.indexOf(span) === -1) {
            // We've either reached the top of the stack or the stack doesn't contain
            // the span for another reason.
            (0, _shared).debugLog(`Tracing span was not found in stack for: ${span.name}`);
            stoppedSpans.add(span);
            span.stop();
            break;
        } else if (stack.indexOf(span) !== -1) {
            (0, _shared).debugLog(`Attempted to pop span that was not at top of stack for: ${span.name}`);
            stoppedSpans.add(poppedSpan);
            poppedSpan.stop();
        }
    }
}

//# sourceMappingURL=autoparent.js.map