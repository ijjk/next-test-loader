/// <reference types="react" />
declare type ImageProps = {
    src: string;
    host: string;
    sizes: string;
    breakpoints: number[];
    priority: boolean;
    unoptimized: boolean;
    rest: any[];
};
export default function Image({ src, host, sizes, unoptimized, priority, ...rest }: ImageProps): JSX.Element;
export {};
