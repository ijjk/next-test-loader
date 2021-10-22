import { webpack } from 'next/dist/compiled/webpack/webpack';
import type webpack5 from 'webpack5';
import { Span } from '../trace';
export declare type CompilerResult = {
    errors: webpack5.StatsError[];
    warnings: webpack5.StatsError[];
};
export declare function runCompiler(config: webpack.Configuration, { runWebpackSpan }: {
    runWebpackSpan: Span;
}): Promise<CompilerResult>;
