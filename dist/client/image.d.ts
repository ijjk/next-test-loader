/// <reference types="react" />
declare const VALID_LOADING_VALUES: readonly ["lazy", "eager", undefined];
declare type LoadingValue = typeof VALID_LOADING_VALUES[number];
declare const VALID_LAYOUT_VALUES: readonly ["fixed", "intrinsic", "responsive", undefined];
declare type LayoutValue = typeof VALID_LAYOUT_VALUES[number];
declare type ImageProps = Omit<JSX.IntrinsicElements['img'], 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> & {
    src: string;
    quality?: number | string;
    priority?: boolean;
    loading?: LoadingValue;
    layout?: LayoutValue;
    unoptimized?: boolean;
} & ({
    width: number | string;
    height: number | string;
    unsized?: false;
} | {
    width?: number | string;
    height?: number | string;
    unsized: true;
});
export default function Image({ src, sizes, unoptimized, priority, loading, layout, className, quality, width, height, unsized, ...rest }: ImageProps): JSX.Element;
export {};
