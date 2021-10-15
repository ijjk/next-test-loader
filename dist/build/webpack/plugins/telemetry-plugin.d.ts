import type { Compiler } from 'webpack';
declare type Feature = 'next/image' | 'next/script' | 'next/dynamic';
interface FeatureUsage {
    featureName: Feature;
    invocationCount: number;
}
/**
 * Plugin that queries the ModuleGraph to look for modules that correspond to
 * certain features (e.g. next/image and next/script) and record how many times
 * they are imported.
 */
export declare class TelemetryPlugin {
    private usageTracker;
    constructor();
    apply(compiler: Compiler): void;
    usages(): FeatureUsage[];
}
export {};
