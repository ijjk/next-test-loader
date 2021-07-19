"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.recursiveCopy = recursiveCopy;
var _path = _interopRequireDefault(require("path"));
var _fs = require("fs");
var _asyncSema = require("next/dist/compiled/async-sema");
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const COPYFILE_EXCL = _fs.constants.COPYFILE_EXCL;
async function recursiveCopy(source, dest, { concurrency =32 , overwrite =false , filter =()=>true
  } = {
}) {
    const cwdPath = process.cwd();
    const from = _path.default.resolve(cwdPath, source);
    const to = _path.default.resolve(cwdPath, dest);
    const sema = new _asyncSema.Sema(concurrency);
    async function _copy(item) {
        const target = item.replace(from, to);
        const stats = await _fs.promises.stat(item);
        await sema.acquire();
        if (stats.isDirectory()) {
            try {
                await _fs.promises.mkdir(target);
            } catch (err) {
                // do not throw `folder already exists` errors
                if (err.code !== 'EEXIST') {
                    throw err;
                }
            }
            sema.release();
            const files = await _fs.promises.readdir(item);
            await Promise.all(files.map((file)=>_copy(_path.default.join(item, file))
            ));
        } else if (stats.isFile() && // before we send the path to filter
        // we remove the base path (from) and replace \ by / (windows)
        filter(item.replace(from, '').replace(/\\/g, '/'))) {
            await _fs.promises.copyFile(item, target, overwrite ? undefined : COPYFILE_EXCL);
            sema.release();
        }
    }
    await _copy(from);
}

//# sourceMappingURL=recursive-copy.js.map