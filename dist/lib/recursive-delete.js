"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.recursiveDelete = recursiveDelete;
var _fs = require("fs");
var _path = require("path");
var _util = require("util");
const sleep = (0, _util).promisify(setTimeout);
const unlinkFile = async (p, t = 1)=>{
    try {
        await _fs.promises.unlink(p);
    } catch (e) {
        if ((e.code === 'EBUSY' || e.code === 'ENOTEMPTY' || e.code === 'EPERM' || e.code === 'EMFILE') && t < 3) {
            await sleep(t * 100);
            return unlinkFile(p, t++);
        }
        if (e.code === 'ENOENT') {
            return;
        }
        throw e;
    }
};
async function recursiveDelete(dir, exclude, previousPath = '') {
    let result;
    try {
        result = await _fs.promises.readdir(dir);
    } catch (e) {
        if (e.code === 'ENOENT') {
            return;
        }
        throw e;
    }
    await Promise.all(result.map(async (part)=>{
        const absolutePath = (0, _path).join(dir, part);
        const pathStat = await _fs.promises.stat(absolutePath).catch((e)=>{
            if (e.code !== 'ENOENT') throw e;
        });
        if (!pathStat) {
            return;
        }
        const pp = (0, _path).join(previousPath, part);
        if (pathStat.isDirectory() && (!exclude || !exclude.test(pp))) {
            await recursiveDelete(absolutePath, exclude, pp);
            return _fs.promises.rmdir(absolutePath);
        }
        if (!exclude || !exclude.test(pp)) {
            return unlinkFile(absolutePath);
        }
    }));
}

//# sourceMappingURL=recursive-delete.js.map