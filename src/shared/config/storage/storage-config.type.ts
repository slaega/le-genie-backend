export type StorageDriver = 'local' | 's3' | 'minio' | 'r2'

export type StorageConfig = {
    driver: StorageDriver
    // S3-compatible (s3 | minio | r2)
    accessKeyId?: string
    secretAccessKey?: string
    endpoint?: string
    bucket?: string
    region?: string
    publicUrl?: string
    forcePathStyle?: boolean
    // Local
    uploadDir?: string
    localPublicUrl?: string
}
