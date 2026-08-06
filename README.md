# XYTEEE API

Railway-ready Node.js API for authenticated Cloudflare R2 media uploads.

## Deployment

Railway detects `railway.json` and runs `npm start`. It supplies `PORT` automatically. After deployment, generate a public domain and verify `GET /health`.

## Variables and security

Add all values from `.env.example` in the Railway service **Variables** panel.

- Keep Supabase service-role/database credentials, R2 credentials, SMTP credentials, Google OAuth secrets, and `AUTH_JWT_SECRET` in Railway only.
- Vercel should hold only `NEXT_PUBLIC_API_URL` and public browser configuration such as `NEXT_PUBLIC_SUPABASE_URL` and its publishable key.
- Set `CORS_ORIGINS` to the production XYTEEE frontend URL. Add preview domains only when they need API access.

## Current media API

Every media request requires a signed-in Supabase access token:

```
Authorization: Bearer <supabase-access-token>
```

- `POST /v1/media` — multipart form upload, `file` field; accepts images, MP4/WebM video, and MP3/M4A/WAV audio up to 25 MB.
- `DELETE /v1/media/<object-key>` — deletes only an object owned by the authenticated user.

The upload response contains an immutable R2 URL. Store that URL or its key with the associated post/profile record.

## Railway-owned authentication migration

The existing deployed XYTEEE frontend still uses Supabase Auth. Replacing it with Railway-owned email/password, SMTP verification, Google OAuth, and Railway JWT sessions requires a coordinated database-schema and frontend migration. Do not remove Supabase Auth from the active app until that migration is deployed together.
