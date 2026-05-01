import path from 'node:path'
import { defineConfig } from 'prisma/config'

type Provider = 'postgres' | 'mysql' | 'sqlite'

const SUPPORTED: Provider[] = ['postgres', 'mysql', 'sqlite']

const provider = (process.env.DATABASE_PROVIDER ?? 'postgres') as Provider

if (!SUPPORTED.includes(provider)) {
  throw new Error(
    `DATABASE_PROVIDER "${provider}" invalide. Valeurs acceptées : ${SUPPORTED.join(' | ')}`,
  )
}

export default defineConfig({
  schema: path.join('prisma', provider, 'schema.prisma'),
  migrations: {
    path: path.join('prisma', provider, 'migrations'),
  },
})
