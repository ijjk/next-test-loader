/// <reference types="react" />
declare type ImageProps = Omit<JSX.IntrinsicElements['img'], 'src' | 'srcSet' | 'ref' | 'width' | 'height'> & {
    src: string;
    quality?: string;
    priority?: boolean;
    lazy?: boolean;
    unoptimized?: boolean;
} & ({
    width: number;
    height: number;
    unsized?: false;
} | {
    width?: number;
    height?: number;
    unsized: true;
});
export default function Image({ src, sizes, unoptimized, priority, lazy, className, quality, width, height, unsized, ...rest }: ImageProps): JSX.Element;
export {};
