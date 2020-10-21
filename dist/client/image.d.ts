/// <reference types="react" />
declare type ImageProps = Omit<JSX.IntrinsicElements['img'], 'src' | 'srcSet' | 'ref'> & {
    src: string;
    width: number;
    height: number;
    quality?: string;
    priority?: boolean;
    lazy?: boolean;
    unoptimized?: boolean;
};
export default function Image({ src, sizes, width, height, unoptimized, priority, lazy, className, quality, ...rest }: ImageProps): JSX.Element;
export {};
