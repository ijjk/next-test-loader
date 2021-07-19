"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.recursiveReadDir = recursiveReadDir;
var _fs = require("fs");
var _path = require("path");
async function recursiveReadDir(dir, filter, ignore, arr = [], rootDir = dir) {
    const result = await _fs.promises.readdir(dir);
    await Promise.all(result.map(async (part)=>{
        const absolutePath = (0, _path).join(dir, part);
        if (ignore && ignore.test(part)) return;
        const pathStat = await _fs.promises.stat(absolutePath);
        if (pathStat.isDirectory()) {
            await recursiveReadDir(absolutePath, filter, ignore, arr, rootDir);
            return;
        }
        if (!filter.test(part)) {
            return;
        }
        arr.push(absolutePath.replace(rootDir, ''));
    }));
    return arr.sort();
}

//# sourceMappingURL=recursive-readdir.js.map