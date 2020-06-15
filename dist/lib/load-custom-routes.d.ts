export declare type Rewrite = {
    source: string;
    destination: string;
};
export declare type Redirect = Rewrite & {
    statusCode?: number;
    permanent?: boolean;
};
export declare type Header = {
    source: string;
    headers: Array<{
        key: string;
        value: string;
    }>;
};
export declare function getRedirectStatus(route: Redirect): number;
export declare type RouteType = 'rewrite' | 'redirect' | 'header';
export interface CustomRoutes {
    headers: Header[];
    rewrites: Rewrite[];
    redirects: Redirect[];
}
export default function loadCustomRoutes(config: any): Promise<CustomRoutes>;
