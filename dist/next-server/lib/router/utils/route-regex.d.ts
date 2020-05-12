export declare function getRouteRegex(normalizedRoute: string): {
    re: RegExp;
    namedRegex?: string;
    routeKeys?: {
        [named: string]: string;
    };
    groups: {
        [groupName: string]: {
            pos: number;
            repeat: boolean;
        };
    };
};
