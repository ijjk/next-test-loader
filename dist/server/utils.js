"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isBlockedPage = isBlockedPage;
exports.cleanAmpPath = cleanAmpPath;
exports.resultFromChunks = resultFromChunks;
exports.resultToChunks = resultToChunks;
var _constants = require("../shared/lib/constants");
function isBlockedPage(pathname) {
    return _constants.BLOCKED_PAGES.includes(pathname);
}
function cleanAmpPath(pathname) {
    if (pathname.match(/\?amp=(y|yes|true|1)/)) {
        pathname = pathname.replace(/\?amp=(y|yes|true|1)&?/, '?');
    }
    if (pathname.match(/&amp=(y|yes|true|1)/)) {
        pathname = pathname.replace(/&amp=(y|yes|true|1)/, '');
    }
    pathname = pathname.replace(/\?$/, '');
    return pathname;
}
function resultFromChunks(chunks) {
    return ({ next , complete , error  })=>{
        let canceled = false;
        process.nextTick(()=>{
            try {
                for (const chunk of chunks){
                    if (canceled) {
                        return;
                    }
                    next(chunk);
                }
            } catch (err) {
                if (!canceled) {
                    canceled = true;
                    error(err);
                }
            }
            if (!canceled) {
                canceled = true;
                complete();
            }
        });
        return ()=>{
            canceled = true;
        };
    };
}
function resultToChunks(result) {
    return new Promise((resolve, reject)=>{
        const chunks = [];
        result({
            next: (chunk)=>{
                chunks.push(chunk);
            },
            error: (error)=>reject(error)
            ,
            complete: ()=>resolve(chunks)
        });
    });
}

//# sourceMappingURL=utils.js.map