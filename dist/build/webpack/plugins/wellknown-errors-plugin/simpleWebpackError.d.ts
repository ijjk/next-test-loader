import type webpack5 from 'webpack5';
declare const SimpleWebpackError_base: typeof webpack5.WebpackError;
export declare class SimpleWebpackError extends SimpleWebpackError_base {
    file: string;
    constructor(file: string, message: string);
}
export {};
