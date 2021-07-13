import { NextConfigComplete } from './config-shared';
export { DomainLocales, NextConfig, normalizeConfig } from './config-shared';
export default function loadConfig(phase: string, dir: string, customConfig?: object | null): Promise<NextConfigComplete>;
export declare function isTargetLikeServerless(target: string): boolean;
