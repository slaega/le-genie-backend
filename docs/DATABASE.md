# Database Guide — Le Génie API

The API uses Prisma 7 as its ORM and supports three database providers: PostgreSQL, MySQL, and SQLite. The provider is selected at runtime via environment variables — the same schema file and migration workflow applies to all three.

---

## Table of Contents

1. [Supported providers](#supported-providers)
2. [Switching providers](#switching-providers)
3. [Prisma commands reference](#prisma-commands-reference)
4. [Migration workflow](#migration-workflow)
5. [Seeding](#seeding)
6. [JSON-as-String design decision](#json-as-string-design-decision)
7. [Schema overview](#schema-overview)

---

## Supported providers

| Provider | `DATABASE_PROVIDER` | Recommended for |
|----------|--------------------|--------------------|
| PostgreSQL | `postgresql` | Production |
| MySQL / PlanetScale | `mysql` | Production (MySQL hosts) |
| SQLite | `sqlite` | Local development, CI |

---

## Switching providers

Only two environment variables control the database connection:

```env
DATABASE_PROVIDER=postgresql   # or mysql or sqlite
DATABASE_URL=postgresql://user:pass@localhost:5432/legenie
```

### PostgreSQL

```env
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://legenie_owner:password@localhost:5432/legenie
```

Start a local instance with Docker:

```bash
docker compose up -d db
```

The `docker-compose.yaml` in `api/` starts a `postgres:15-alpine` container with the credentials above.

### MySQL

```env
DATABASE_PROVIDER=mysql
DATABASE_URL=mysql://legenie_owner:password@localhost:3306/legenie
```

### SQLite (fastest for local dev and CI)

```env
DATABASE_PROVIDER=sqlite
DATABASE_URL=file:./dev.db
```

No external service required. The database file is created automatically by Prisma.

> **Important:** When switching providers, always run `prisma migrate dev` against the new database. Migrations are provider-specific SQL files — do not copy migrations between providers.

---

## Prisma commands reference

All commands must be run from the `api/` directory.

```bash
# Apply pending migrations to the database
yarn prisma migrate dev

# Apply pending migrations to the database with a new migration name
yarn prisma migrate dev --name describe_your_change

# Apply migrations in CI / production (no prompt, no migration generation)
yarn prisma migrate deploy

# Reset the database (drops all data and re-applies all migrations)
yarn prisma migrate reset

# Open Prisma Studio (visual DB browser)
yarn prisma studio

# Regenerate the Prisma Client after schema changes
yarn prisma generate

# Validate the schema without applying changes
yarn prisma validate

# Format the schema file
yarn prisma format
```

---

## Migration workflow

### Development

1. Edit `api/prisma/schema.prisma`.
2. Run `yarn prisma migrate dev --name <describe_the_change>`.
   - Prisma generates a SQL migration file in `prisma/migrations/`.
   - Prisma applies the migration to your local database.
   - Prisma regenerates the client.
3. Commit both the updated `schema.prisma` and the new migration folder.

```bash
# Example: adding a viewCount column to posts
# 1. Add the field to schema.prisma
# 2. Run:
yarn prisma migrate dev --name add_view_count_to_posts
# 3. Commit:
git add prisma/schema.prisma prisma/migrations/
git commit -m "chore(prisma): add view_count column to posts"
```

### CI / Production

In CI and production, **never run `migrate dev`** — it prompts for input and can shadow-drop data. Use the non-interactive command:

```bash
yarn prisma migrate deploy
```

Add this to your deployment pipeline before starting the application:

```dockerfile
# Dockerfile (already present in api/)
RUN yarn prisma generate
CMD ["sh", "-c", "yarn prisma migrate deploy && yarn start:prod"]
```

### Resolving migration conflicts

If two branches create conflicting migrations:

```bash
# On the branch that needs to be rebased:
git rebase origin/main

# Re-generate the migration (it will be based on the latest state)
yarn prisma migrate dev --name re_add_my_change
```

Delete the conflicting migration folder and regenerate — do not manually merge SQL files.

---

## Seeding

The seed script is located at `api/prisma/seed.ts` (create it if it does not exist). Register it in `package.json`:

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

Run seeding after migrations:

```bash
yarn prisma db seed
```

Or as part of `migrate reset` (Prisma runs the seed automatically after reset):

```bash
yarn prisma migrate reset
```

**Example seed structure:**

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@legenie.dev' },
    update: {},
    create: {
      email: 'admin@legenie.dev',
      name: 'Admin',
    },
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## JSON-as-String design decision

### The problem

Post content is rich text authored in TipTap, which produces a JSON document (the TipTap `JSONContent` object). The most natural storage choice would be a `Json` column type in Prisma. However:

- Prisma's `Json` type maps to `jsonb` on PostgreSQL, `json` on MySQL, and is **not supported at all on SQLite**.
- Using `Json` would make the schema SQLite-incompatible and require a provider-specific migration.

### The solution

The `content` column is declared as `String` (`TEXT` on all providers):

```prisma
model Post {
  // Stored as TipTap JSON string — generateHTML() on read for SSR/SEO
  content String @default("{}")
}
```

The TipTap JSON document is `JSON.stringify()`-ed before being saved and `JSON.parse()`-ed after being read. This happens in the application layer, not in Prisma.

### Trade-offs

| Concern | Impact |
|---------|--------|
| No DB-level JSON query | We never query inside the content field — full-text search is out of scope |
| Slightly more application code | Minimal: a one-liner `JSON.parse` on read |
| Universal compatibility | SQLite, MySQL, and PostgreSQL all support `TEXT` identically |
| TipTap round-trip fidelity | JSON is TipTap's canonical format — zero data loss |

### How it flows

```
TipTap editor (web)
    │  editorRef.current.getJSON()  → JSONContent object
    │  JSON.stringify(json)          → string sent in PATCH /posts body
    ▼
API (application layer)
    │  JSON stored as TEXT in DB
    ▼
API (read path)
    │  content returned as string
    ▼
BlogViewer (Next.js Server Component)
    │  JSON.parse(content)          → JSONContent object
    │  generateHTML(doc, extensions) → HTML string
    ▼
<div dangerouslySetInnerHTML={{ __html: html }} />
```

---

## Schema overview

The full schema is at `api/prisma/schema.prisma`. Key models:

| Model | Table | Purpose |
|-------|-------|---------|
| `User` | `users` | Platform accounts (created via OAuth) |
| `Post` | `posts` | Blog posts (content stored as TipTap JSON string) |
| `Contributor` | `contributors` | Post ↔ User join with `owner` flag |
| `Comment` | `comments` | Post comments |
| `Invitation` | `invitations` | Pending collaboration invitations (with expiry) |
| `AuthProvider` | `auth_providers` | Linked OAuth accounts per user (Google, GitHub) |
| `RefreshToken` | `refresh_tokens` | Active refresh tokens (one per session) |
| `Tag` | `tags` | Global tag registry |
| `PostTag` | `post_tags` | Post ↔ Tag join |
| `PostReader` | `post_readers` | View tracking per post (unique per reader fingerprint) |

### Enums

```prisma
enum PostStatus { EMPTY  DRAFT  PUBLISHED  ARCHIVED }
enum Provider   { GOOGLE  GITHUB }
```

### Key indexes

- `Post`: composite on `(status, createdAt)` — optimizes the list query with status filtering and recent sort.
- `Contributor`: unique on `(postId, userId)` — prevents duplicate contributors.
- `Invitation`: unique on `(postId, email)` — prevents duplicate invitations; index on `token` for fast token lookup.
- `PostReader`: unique on `(postId, readerId)` — deduplicates view counts.
