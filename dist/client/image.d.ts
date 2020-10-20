/// <reference types="react" />
declare type ImageProps = Omit<JSX.IntrinsicElements['img'], 'src' | 'srcSet' | 'ref'> & {
    src: string;
    host?: string;
    priority?: boolean;
    lazy?: boolean;
    unoptimized?: boolean;
};
export default function Image({ src, host, sizes, unoptimized, priority, lazy, className, ...rest }: ImageProps): JSX.Element;
export {};
