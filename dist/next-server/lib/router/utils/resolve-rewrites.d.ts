/// <reference types="node" />
import { ParsedUrlQuery } from 'querystring';
import { Rewrite } from '../../../../lib/load-custom-routes';
export default function resolveRewrites(asPath: string, pages: string[], basePath: string, rewrites: Rewrite[], query: ParsedUrlQuery): string;
