import * as fs from 'fs/promises'
import * as path from 'path'
import type { StorageConfig } from '#config/storage/storage-config.type'
import type { StorageProvider } from '#domain/services/storage.provider'
import { Logger, NotFoundException } from '@nestjs/common'

/**
 * Local filesystem storage — intended for development / single-node deployments.
 * Files are served via the NestJS static assets or a CDN reverse-proxy.
 */
export class LocalStorageProvider implements StorageProvider {
    private readonly logger = new Logger(LocalStorageProvider.name)
    private readonly root: string

    constructor(private readonly config: StorageConfig) {
        this.root = path.resolve(config.uploadDir ?? './uploads')
    }

    private resolvePath(filePath: string): string {
        return path.join(this.root, filePath)
    }

    async upload({
        path: filePath,
        file,
        contentType: _contentType,
    }: {
        path: string
        file: Buffer | Blob
        contentType?: string
    }): Promise<string> {
        const dest = this.resolvePath(filePath)
        await fs.mkdir(path.dirname(dest), { recursive: true })

        const buf = Buffer.isBuffer(file)
            ? file
            : Buffer.from(await (file as Blob).arrayBuffer())

        await fs.writeFile(dest, buf)
        this.logger.log(`Saved file locally: ${dest}`)
        return filePath
    }

    async download(filePath: string): Promise<Buffer> {
        const dest = this.resolvePath(filePath)
        try {
            return await fs.readFile(dest)
        } catch {
            throw new NotFoundException(`File not found: ${filePath}`)
        }
    }

    async delete(filePath: string): Promise<void> {
        const dest = this.resolvePath(filePath)
        await fs.rm(dest, { force: true })
    }

    async getPublicUrl(filePath: string): Promise<string> {
        const base = (this.config.localPublicUrl ?? 'http://localhost:3030').replace(/\/$/, '')
        return `${base}/uploads/${filePath}`
    }
}
