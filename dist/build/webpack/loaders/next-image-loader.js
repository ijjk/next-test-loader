"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = exports.raw = void 0;
var _loaderUtils = _interopRequireDefault(require("next/dist/compiled/loader-utils"));
var _imageSize = _interopRequireDefault(require("image-size"));
var _main = require("../../../server/lib/squoosh/main");
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const BLUR_IMG_SIZE = 8;
const BLUR_QUALITY = 70;
const VALID_BLUR_EXT = [
    'jpeg',
    'png',
    'webp'
];
function nextImageLoader(content) {
    const imageLoaderSpan = this.currentTraceSpan.traceChild('next-image-loader');
    return imageLoaderSpan.traceAsyncFn(async ()=>{
        const { isServer , isDev , assetPrefix  } = _loaderUtils.default.getOptions(this);
        const context = this.rootContext;
        const opts = {
            context,
            content
        };
        const interpolatedName = _loaderUtils.default.interpolateName(this, '/static/image/[path][name].[hash].[ext]', opts);
        const outputPath = '/_next' + interpolatedName;
        let extension = _loaderUtils.default.interpolateName(this, '[ext]', opts);
        if (extension === 'jpg') {
            extension = 'jpeg';
        }
        const imageSizeSpan = imageLoaderSpan.traceChild('image-size-calculation');
        const imageSize = imageSizeSpan.traceFn(()=>(0, _imageSize).default(content)
        );
        let blurDataURL;
        if (VALID_BLUR_EXT.includes(extension)) {
            if (isDev) {
                const prefix = 'http://localhost';
                const url = new URL('/_next/image', prefix);
                url.searchParams.set('url', assetPrefix + outputPath);
                url.searchParams.set('w', BLUR_IMG_SIZE);
                url.searchParams.set('q', BLUR_QUALITY);
                blurDataURL = url.href.slice(prefix.length);
            } else {
                // Shrink the image's largest dimension
                const resizeOperationOpts = imageSize.width >= imageSize.height ? {
                    type: 'resize',
                    width: BLUR_IMG_SIZE
                } : {
                    type: 'resize',
                    height: BLUR_IMG_SIZE
                };
                const resizeImageSpan = imageLoaderSpan.traceChild('image-resize');
                const resizedImage = await resizeImageSpan.traceAsyncFn(()=>(0, _main).processBuffer(content, [
                        resizeOperationOpts
                    ], extension, BLUR_QUALITY)
                );
                const blurDataURLSpan = imageLoaderSpan.traceChild('image-base64-tostring');
                blurDataURL = blurDataURLSpan.traceFn(()=>`data:image/${extension};base64,${resizedImage.toString('base64')}`
                );
            }
        }
        const stringifiedData = imageLoaderSpan.traceChild('image-data-stringify').traceFn(()=>JSON.stringify({
                src: outputPath,
                height: imageSize.height,
                width: imageSize.width,
                blurDataURL
            })
        );
        if (!isServer) {
            this.emitFile(interpolatedName, content, null);
        }
        return `export default ${stringifiedData};`;
    });
}
const raw = true;
exports.raw = raw;
var _default = nextImageLoader;
exports.default = _default;

//# sourceMappingURL=next-image-loader.js.map