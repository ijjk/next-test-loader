import { SimpleWebpackError } from './simpleWebpackError';
import type webpack5 from 'webpack5';
export declare function getModuleBuildError(compilation: webpack5.Compilation, input: any): Promise<SimpleWebpackError | false>;
