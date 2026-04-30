# API Reference — Le Génie

Base URL: `http://localhost:3030` (development)

All endpoints return JSON. Authenticated endpoints require a valid `access_token` cookie (set automatically after login). The Swagger UI is available at `http://localhost:3030/docs`.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Posts (management)](#posts-management)
3. [CMS (public headless API)](#cms-public-headless-api)
4. [Comments](#comments)
5. [Invitations](#invitations)
6. [Contributors](#contributors)
7. [Post Images](#post-images)
8. [Common types](#common-types)
9. [Error responses](#error-responses)

---

## Authentication

### `POST /auth/token`

Exchange an OAuth authorization code for JWT tokens. Supports Google and GitHub.

**Auth required:** No

**Request body:**

```json
{
  "provider": "google",
  "code": "4/0AX4XfWh...",
  "redirectUri": "http://localhost:3000/auth/callback"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `provider` | `"google" \| "github"` | Yes | OAuth provider |
| `code` | `string` | Yes | Authorization code from the OAuth redirect |
| `redirectUri` | `string` | Yes | Must match the registered redirect URI |

**Response `200`:**

```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```

Tokens are also set as `httpOnly` cookies (`access_token`, `refresh_token`).

---

### `POST /auth/refresh-token`

Issue a new access token using a valid refresh token.

**Auth required:** Refresh token (Bearer `Authorization` header or `refresh_token` cookie)

**Request body:** _(empty)_

**Response `200`:**

```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```

---

### `GET /auth/me`

Return the currently authenticated user's profile.

**Auth required:** Yes (access token)

**Response `200`:**

```json
{
  "id": "clx...",
  "email": "user@example.com",
  "name": "Alice Dupont",
  "avatarPath": "https://...",
  "coverPath": null,
  "professionalRole": "Engineer",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

---

## Posts (management)

These endpoints are for authenticated users managing their own posts.

### `POST /posts`

Create a new empty draft post. The authenticated user becomes the post's owner (contributor with `owner: true`).

**Auth required:** Yes

**Request body:** _(empty)_

**Response `200`:** [`PostResponse`](#postresponse)

---

### `PATCH /posts/:postId`

Update a post's content, title, status, or cover image. Only contributors of the post may call this endpoint.

**Auth required:** Yes

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | No | Post title (max 255 chars) |
| `content` | `string` | No | TipTap JSON document serialized as a string |
| `status` | `PostStatus` | No | `EMPTY \| DRAFT \| PUBLISHED \| ARCHIVED` |
| `imageFile` | `File` | No | Cover image (JPEG, PNG, WebP) |

**Response `200`:** [`PostResponse`](#postresponse)

---

### `DELETE /posts/:postId`

Delete a post permanently. Only the post **owner** may call this.

**Auth required:** Yes

**Response `200`:** _(empty)_

---

### `GET /posts/:postId`

Fetch a single post by ID. Authenticated users can see posts in any status. Anonymous users only see `PUBLISHED` posts.

**Auth required:** Optional

**Response `200`:** [`PostResponse`](#postresponse)

---

### `GET /posts`

List posts with filtering, sorting, and pagination.

**Auth required:** Optional

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `12` | Items per page (max 50) |
| `status` | `PostStatus` | — | Filter by status (authenticated users only for non-PUBLISHED) |
| `tags` | `string` | — | Comma-separated tag names to filter by |
| `sort` | `"recent" \| "popular"` | `"recent"` | Sort order |
| `me` | `boolean` | `false` | When `true`, return only the authenticated user's posts |

**Response `200`:**

```json
{
  "items": [ PostResponse ],
  "total": 42,
  "page": 1,
  "limit": 12,
  "hasNextPage": true
}
```

---

## CMS (public headless API)

The CMS endpoints are **public** and require **no authentication**. They exclusively serve `PUBLISHED` posts. These are the endpoints to use when building a public-facing website, mobile app, or any external integration.

### `GET /cms/posts`

List published posts. Identical query parameters to `GET /posts`, except `status` and `me` are ignored (always returns `PUBLISHED` only).

**Auth required:** No

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `12` | Items per page (max 50) |
| `tags` | `string` | — | Comma-separated tag names |
| `sort` | `"recent" \| "popular"` | `"recent"` | Sort order |

**Response `200`:**

```json
{
  "items": [ PostResponse ],
  "total": 18,
  "page": 1,
  "limit": 12,
  "hasNextPage": true
}
```

---

### `GET /cms/posts/:id`

Fetch a single published post by ID. Returns `404` if the post does not exist or is not in `PUBLISHED` status.

**Auth required:** No

**Response `200`:** [`PostResponse`](#postresponse)

**Response `404`:**

```json
{ "statusCode": 404, "message": "Post not found" }
```

---

### `GET /cms/posts/:id/related`

Return up to 3 published posts that share at least one tag with the specified post. The current post is excluded from the results. Returns an empty array if the post has no tags.

**Auth required:** No

**Response `200`:**

```json
{
  "items": [ PostResponse ]
}
```

`items` contains 0 to 3 entries, never the post identified by `:id`.

---

## Comments

Comments are nested under posts.

### `POST /posts/:postId/comments`

Add a comment to a post.

**Auth required:** Yes

**Request body:**

```json
{ "content": "Great article!" }
```

**Response `200`:** [`CommentResponse`](#commentresponse)

---

### `PATCH /posts/:postId/comments/:commentId`

Edit an existing comment. Only the comment author may edit it.

**Auth required:** Yes

**Request body:**

```json
{ "content": "Updated comment text." }
```

**Response `200`:** [`CommentResponse`](#commentresponse)

---

### `DELETE /posts/:postId/comments/:commentId`

Delete a comment. Only the comment author or post owner may delete.

**Auth required:** Yes

**Response `200`:** _(empty)_

---

### `GET /posts/:postId/comments`

List comments for a post, ordered by creation date ascending.

**Auth required:** No

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `10` | Items per page |

**Response `200`:**

```json
{
  "items": [ CommentResponse ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "hasNextPage": false
}
```

---

## Invitations

Invitations allow post owners to invite other users as contributors.

### `POST /post/:postId/invitations`

Send a collaboration invitation to an email address.

**Auth required:** Yes (must be a contributor of the post)

**Request body:**

```json
{ "email": "collaborator@example.com" }
```

**Response `200`:** Invitation object

---

### `PUT /post/:postId/invitations/:invitationId`

Accept a pending invitation. The authenticated user's email must match the invitation's target email.

**Auth required:** Yes

**Response `200`:** _(empty — user is now a contributor)_

---

### `DELETE /post/:postId/invitations/:invitationId/refuse`

Decline a pending invitation.

**Auth required:** Yes

**Response `200`:** _(empty)_

---

### `DELETE /post/:postId/invitations/:invitationId/cancel`

Cancel an invitation that was already sent. Only the post owner may cancel.

**Auth required:** Yes

**Response `200`:** _(empty)_

---

## Contributors

### `DELETE /post/:postId/contributors/:contributorId`

Remove a contributor from a post, or leave as a contributor yourself. Post owners cannot remove themselves via this endpoint.

**Auth required:** Yes

**Response `200`:** _(empty)_

---

## Post Images

Inline images for the TipTap editor. Images are stored via the configured storage driver and a public URL is returned for embedding.

### `POST /posts/:postId/images`

Upload an inline image and receive a public URL to embed in the post content.

**Auth required:** Yes (must be a contributor of the post)

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `imageFile` | `File` | Yes | Image file (JPEG, PNG, WebP, GIF) |

**Response `200`:**

```json
{ "url": "https://storage.example.com/posts/clx.../img_abc.jpg" }
```

---

## Common types

### `PostResponse`

```json
{
  "id": "clx...",
  "title": "My Article",
  "imagePath": "https://...",
  "content": { "type": "doc", "content": [ ... ] },
  "status": "PUBLISHED",
  "readingTime": 5,
  "contributors": [
    {
      "id": "clx...",
      "userId": "clx...",
      "owner": true,
      "user": {
        "id": "clx...",
        "name": "Alice",
        "avatarPath": "https://...",
        "email": "alice@example.com"
      }
    }
  ],
  "postTags": [
    { "id": "clx...", "name": "typescript" }
  ],
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-16T09:00:00.000Z"
}
```

The `content` field contains the TipTap JSON document. The `BlogViewer` server component converts this to HTML using `generateHTML()` for SEO.

### `PostStatus`

```
EMPTY      — newly created, no content
DRAFT      — work in progress, not public
PUBLISHED  — visible to the public
ARCHIVED   — no longer public, preserved for authors
```

### `CommentResponse`

```json
{
  "id": "clx...",
  "content": "Great read!",
  "postId": "clx...",
  "userId": "clx...",
  "user": {
    "id": "clx...",
    "name": "Bob",
    "avatarPath": "https://..."
  },
  "refactorAt": null,
  "createdAt": "2025-01-15T12:00:00.000Z",
  "updatedAt": "2025-01-15T12:00:00.000Z"
}
```

---

## Error responses

All errors follow a consistent shape:

```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [
    { "field": "title", "message": "must not be empty" }
  ]
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request / validation error |
| `401` | Missing or invalid access token |
| `403` | Authenticated but not authorized for this resource |
| `404` | Resource not found |
| `409` | Conflict (e.g., duplicate invitation) |
| `422` | Unprocessable entity |
| `429` | Rate limit exceeded |
| `500` | Internal server error |
