export interface StorageProvider {
    upload(params: {
        path: string;
        file: Buffer | Blob;
        contentType?: string;
    }): Promise<string>;

    download(path: string): Promise<Buffer | Blob>;

    delete(path: string): Promise<void>;

    getPublicUrl(path: string): Promise<string>;
}
