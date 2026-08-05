# XYTEEE API

Railway-ready Node.js API for authenticated uploads to Cloudflare R2.

## Railway

1. Import this repository into Railway.
2. Add the values shown in `.env.example` in the Railway service **Variables** panel. Keep `SUPABASE_SERVICE_ROLE_KEY` and all R2 credentials private.
3. Generate a public domain in **Settings → Networking**.
4. Set `CORS_ORIGINS` to the production XYTEEE frontend URL (and any preview URLs you intentionally allow).

Railway runs `npm start` and supplies `PORT` automatically. Check `GET /health` after deploy.

## API

Every media request requires the signed-in user's Supabase access token:

```
Authorization: Bearer <supabase-access-token>
```

- `POST /v1/media` — multipart form upload, file field name: `file`; accepts images, MP4/WebM video, and MP3/M4A/WAV audio up to 25 MB.
- `DELETE /v1/media/<object-key>` — deletes only an object owned by the authenticated user.

The upload response contains the immutable R2 object URL. Store that URL or key with the associated Supabase post/profile record.
