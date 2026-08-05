import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'R2_PUBLIC_URL'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);

const app = express();
const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.CORS_ORIGINS || 'https://social-app-inky-one.vercel.app').split(',').map((value) => value.trim()).filter(Boolean);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket }
});
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY }
});
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024, files: 1 } });
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp4', 'audio/wav']);
const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'video/mp4': 'mp4', 'video/webm': 'webm', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/wav': 'wav' };

app.use(cors({ origin(origin, done) { if (!origin || allowedOrigins.includes(origin)) return done(null, true); return done(new Error('Origin is not allowed')); }, methods: ['GET', 'POST', 'DELETE', 'OPTIONS'], allowedHeaders: ['Authorization', 'Content-Type'] }));
app.use(express.json({ limit: '100kb' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

async function requireUser(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Invalid session' });
  req.user = data.user;
  next();
}

app.post('/v1/media', requireUser, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Attach one file in the file field' });
    if (!allowedTypes.has(req.file.mimetype)) return res.status(415).json({ error: 'Unsupported media type' });
    const key = `${req.user.id}/${crypto.randomUUID()}.${extensions[req.file.mimetype]}`;
    await r2.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, Body: req.file.buffer, ContentType: req.file.mimetype }));
    const base = process.env.R2_PUBLIC_URL.replace(/\/$/, '');
    res.status(201).json({ key, url: `${base}/${key}`, contentType: req.file.mimetype, size: req.file.size });
  } catch (error) { next(error); }
});

app.delete('/v1/media/*key', requireUser, async (req, res, next) => {
  try {
    const key = Array.isArray(req.params.key) ? req.params.key.join('/') : req.params.key;
    if (!key?.startsWith(`${req.user.id}/`)) return res.status(403).json({ error: 'You can only delete your own media' });
    await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
    res.status(204).end();
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => { console.error(error); res.status(error instanceof multer.MulterError ? 400 : 500).json({ error: error.message || 'Internal server error' }); });
app.listen(port, () => console.log(`XYTEEE API listening on ${port}`));
