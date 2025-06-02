export interface StorageProvider {
  uploadFile(file: File, path: string): Promise<string>;
  removeFile(filePath: string): Promise<void>;
  getFileUrl(filePath: string): string;
}
