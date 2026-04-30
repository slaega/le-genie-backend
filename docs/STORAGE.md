# Storage Driver Configuration — Le Génie API

The API abstracts file storage behind a `StorageProvider` interface. The concrete implementation is chosen at startup based on the `STORAGE_DRIVER` environment variable. No code changes are required to switch between drivers.

---

## Table of Contents

1. [How it works](#how-it-works)
2. [Driver: local](#driver-local)
3. [Driver: minio](#driver-minio)
4. [Driver: r2 (Cloudflare R2)](#driver-r2-cloudflare-r2)
5. [Driver: s3 (AWS S3)](#driver-s3-aws-s3)
6. [Environment variable reference](#environment-variable-reference)
7. [Docker Compose examples](#docker-compose-examples)
8. [Adding a custom provider](#adding-a-custom-provider)

---

## How it works

The `StorageModule` reads the configuration at startup and instantiates the correct provider class. It then exposes the provider under the `STORAGE_PROVIDER` injection token, which is used by command handlers (e.g., `UploadImageHandler`, `UpdatePostHandler`).

```
STORAGE_DRIVER env var
        │
        ▼
StorageModule (factory)
        │
        ├── "local"          → LocalStorageProvider
        ├── "minio"          → S3CompatibleProvider (forcePathStyle=true)
        ├── "r2"             → S3CompatibleProvider (forcePathStyle=true)
        └── "s3"             → S3CompatibleProvider (forcePathStyle=false)
```

The `StorageProvider` interface declares three operations:

```typescript
interface StorageProvider {
  upload(params: { path: string; file: Buffer | Blob; contentType?: string }): Promise<string>
  download(path: string): Promise<Buffer>
  delete(path: string): Promise<void>
  getPublicUrl(path: string): Promise<string>
}
```

All four drivers implement this interface. Command handlers use the interface, never the concrete class.

---

## Driver: local

**Use when:** local development or single-node deployments where S3 is not available.

Files are written to the local filesystem under `STORAGE_UPLOAD_DIR` (relative to the `api/` directory). The NestJS static file server or an Nginx reverse proxy must serve the `uploads/` directory.

**Environment variables:**

```env
STORAGE_DRIVER=local
STORAGE_UPLOAD_DIR=./uploads
NEXT_PUBLIC_APP_URL=http://localhost:3030
```

`NEXT_PUBLIC_APP_URL` is used as the base for public URLs:
`http://localhost:3030/uploads/posts/clx.../cover.jpg`

**Caveats:**
- Files are lost if the container is recreated without a volume mount.
- Not suitable for multi-replica deployments (each instance has its own disk).
- Serve the `uploads/` directory as static assets or via a reverse proxy.

---

## Driver: minio

**Use when:** staging environments, on-premise deployments, or local development that mirrors production S3 behavior.

MinIO is an S3-compatible object store you can run yourself. The `STORAGE_DRIVER=minio` setting uses the same `S3CompatibleProvider` as AWS S3 but forces `forcePathStyle=true` (required by MinIO).

**Environment variables:**

```env
STORAGE_DRIVER=minio
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_BUCKET=legenie
STORAGE_ACCESS_ID=your-minio-access-key
STORAGE_ACCESS_KEY=your-minio-secret-key
STORAGE_REGION=eu-central-1
STORAGE_PUBLIC_URL=http://localhost:9000/legenie
```

**Steps to set up:**

1. Start MinIO (see docker-compose example below).
2. Open the MinIO console at `http://localhost:9001`.
3. Create a bucket named `legenie` and set its access policy to **public** (for public post images).
4. Create an access key/secret in the console or use the root credentials for development.
5. Set the env vars above and restart the API.

**Creating a public bucket via mc (MinIO CLI):**

```bash
mc alias set local http://localhost:9000 MINIO_ACCESS_KEY MINIO_SECRET_KEY
mc mb local/legenie
mc anonymous set download local/legenie
```

---

## Driver: r2 (Cloudflare R2)

**Use when:** production deployments on Cloudflare infrastructure; zero egress fees for reads.

R2 is S3-compatible with a Cloudflare-specific endpoint. The driver automatically sets `forcePathStyle=true`.

**Environment variables:**

```env
STORAGE_DRIVER=r2
STORAGE_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
STORAGE_BUCKET=legenie
STORAGE_ACCESS_ID=<R2_ACCESS_KEY_ID>
STORAGE_ACCESS_KEY=<R2_SECRET_ACCESS_KEY>
STORAGE_REGION=auto
STORAGE_PUBLIC_URL=https://pub-<hash>.r2.dev
```

**`STORAGE_PUBLIC_URL`** should point to your R2 public bucket URL or a custom domain configured in the Cloudflare dashboard.

**Steps to set up:**

1. Go to **Cloudflare Dashboard → R2 → Create bucket**.
2. Enable **public access** on the bucket (or use a custom domain via a worker).
3. Create an **API token** with `Object Read & Write` permission scoped to your bucket.
4. Set `STORAGE_ENDPOINT` to `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` where `<ACCOUNT_ID>` is your Cloudflare account ID.
5. Set `STORAGE_ACCESS_ID` and `STORAGE_ACCESS_KEY` from the API token credentials.

---

## Driver: s3 (AWS S3)

**Use when:** production deployments on AWS.

**Environment variables:**

```env
STORAGE_DRIVER=s3
STORAGE_BUCKET=legenie-prod
STORAGE_REGION=eu-west-1
STORAGE_ACCESS_ID=AKIAIOSFODNN7EXAMPLE
STORAGE_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
STORAGE_PUBLIC_URL=https://legenie-prod.s3.eu-west-1.amazonaws.com
```

Do not set `STORAGE_ENDPOINT` for AWS S3 — the SDK resolves the endpoint from the region automatically.

**Recommended IAM policy for the API user:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::legenie-prod/*"
    }
  ]
}
```

For public image serving, add a bucket policy that allows `s3:GetObject` from `*` for the `posts/*` prefix, or use CloudFront as a CDN in front of the bucket.

---

## Environment variable reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STORAGE_DRIVER` | No | `local` | `local \| minio \| r2 \| s3` |
| `STORAGE_ACCESS_ID` | For S3 drivers | — | Access key ID |
| `STORAGE_ACCESS_KEY` | For S3 drivers | — | Secret access key |
| `STORAGE_ENDPOINT` | For minio/r2 | — | Custom endpoint URL (must be a valid URL) |
| `STORAGE_BUCKET` | For S3 drivers | — | Bucket name |
| `STORAGE_REGION` | No | `auto` | AWS region (e.g., `eu-west-1`) |
| `STORAGE_PUBLIC_URL` | No | — | Base URL for public file access |
| `STORAGE_UPLOAD_DIR` | No | `./uploads` | Local storage directory (relative to `api/`) |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3030` | Used as base URL for local driver public URLs |

`forcePathStyle` is set automatically: `true` for `minio` and `r2`, `false` for `s3` and `local`.

---

## Docker Compose examples

### MinIO for local development

```yaml
# api/docker-compose.yaml (existing service)
services:
  storage:
    image: minio/minio:latest
    container_name: genie_storage
    environment:
      MINIO_ACCESS_KEY: Q3AM3UQ867SPQQA43P2F
      MINIO_SECRET_KEY: zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG
    ports:
      - "9000:9000"   # S3 API
      - "9001:9001"   # Web console
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

volumes:
  minio_data:
```

**Corresponding `.env` for the API when running inside Docker:**

```env
STORAGE_DRIVER=minio
STORAGE_ENDPOINT=http://storage:9000      # use service name inside Docker network
STORAGE_BUCKET=legenie
STORAGE_ACCESS_ID=Q3AM3UQ867SPQQA43P2F
STORAGE_ACCESS_KEY=zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG
STORAGE_PUBLIC_URL=http://localhost:9000/legenie   # host-accessible URL for the frontend
```

> **Note:** The API container uses the Docker internal hostname (`storage:9000`) to upload files, but the frontend (running in the browser or outside Docker) needs a host-accessible URL (`localhost:9000`) for public image URLs. Configure `STORAGE_PUBLIC_URL` accordingly.

### MinIO for CI / ephemeral environments

```yaml
services:
  storage:
    image: minio/minio:latest
    entrypoint: sh
    command: -c 'mkdir -p /data/legenie && minio server /data --console-address ":9001"'
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
```

---

## Adding a custom provider

1. **Create a new provider class** in `api/src/infra/framwork/common/storage/providers/`:

```typescript
// my-custom.provider.ts
import type { StorageProvider } from '#domain/services/storage.provider'
import type { StorageConfig } from '#config/storage/storage-config.type'

export class MyCustomProvider implements StorageProvider {
  constructor(private readonly config: StorageConfig) {}

  async upload({ path, file, contentType }: {
    path: string
    file: Buffer | Blob
    contentType?: string
  }): Promise<string> {
    // your upload logic
    return path
  }

  async download(path: string): Promise<Buffer> {
    // your download logic
    return Buffer.alloc(0)
  }

  async delete(path: string): Promise<void> {
    // your delete logic
  }

  async getPublicUrl(path: string): Promise<string> {
    return `https://my-cdn.example.com/${path}`
  }
}
```

2. **Add the new driver name** to the `StorageDriver` type in `shared/config/storage/storage-config.type.ts`:

```typescript
export type StorageDriver = 'local' | 's3' | 'minio' | 'r2' | 'mycustom'
```

3. **Register the provider** in the factory inside `storage.module.ts`:

```typescript
case 'mycustom':
  return new MyCustomProvider(storageConfig)
```

4. **Update the validator** in `shared/config/storage/storage.config.ts`:

```typescript
@IsEnum(['local', 's3', 'minio', 'r2', 'mycustom'])
@IsOptional()
STORAGE_DRIVER: StorageDriver
```

5. Set `STORAGE_DRIVER=mycustom` in your environment. No other changes needed.
