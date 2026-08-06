# XYTEEE Platform API

Railway backend for the XYTEEE mobile-first community platform.

## Services

- **Railway**: email/password authentication, Google OAuth, SMTP email verification, JWT sessions, live Socket.IO events, and media API
- **Supabase Postgres**: application database only
- **Cloudflare R2**: profile and community media
- **Vercel**: web frontend

## Railway variables

Keep `DATABASE_URL`, `AUTH_JWT_SECRET`, SMTP credentials, Google OAuth credentials, and R2 credentials in Railway Variables. Do not place server secrets in Vercel.

## Endpoints

- `GET /health`
- `POST /v1/auth/register`, `POST /v1/auth/login`, `POST /v1/auth/verify`
- `GET /v1/auth/google`
- `GET /v1/posts`, `POST /v1/posts`
- `POST /v1/media`

The API emits authenticated Socket.IO `social:update` events for live community actions.
