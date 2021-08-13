export declare function isBlockedPage(pathname: string): boolean;
export declare function cleanAmpPath(pathname: string): string;
export declare type Disposable = () => void;
export declare type Observer<T> = {
    next(chunk: T): void;
    error(error: Error): void;
    complete(): void;
};
export declare type RenderResult = (observer: Observer<string>) => Disposable;
export declare function resultFromChunks(chunks: string[]): RenderResult;
export declare function resultToChunks(result: RenderResult): Promise<string[]>;
