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

// Prisma 7 : l'URL n'est plus dans le schéma.
// - `prisma generate` ne nécessite pas d'URL (pas de connexion DB)
// - `prisma migrate` / `prisma db push` nécessitent DATABASE_URL
const url = process.env.DATABASE_URL

export default defineConfig({
  schema: path.join('prisma', provider, 'schema.prisma'),

  migrations: {
    path: path.join('prisma', provider, 'migrations'),
  },

  // Injecté seulement si DATABASE_URL est défini (évite l'erreur sur `generate`)
  ...(url
    ? {
        datasource: {
          url,
          // MySQL seulement : requis pour `prisma migrate dev` (shadow DB)
          ...(provider === 'mysql' && process.env.SHADOW_DATABASE_URL
            ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL }
            : {}),
        },
      }
    : {}),
})
