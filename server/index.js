import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import catalogRoutes from './routes/catalog.js';
import warehouseRoutes from './routes/warehouse.js';
import integrationRoutes from './routes/integration.js';
import publicRoutes from './routes/public.js';
import './db/index.js';
import path from 'node:path';

const app = express();

const corsOriginEnv = process.env.CORS_ORIGIN || 'http://localhost:8080';
const corsOrigin = corsOriginEnv
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (corsOrigin.length === 0) {
  throw new Error('CORS_ORIGIN must contain at least one allowed origin, separated by commas if multiple.');
}

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/public', publicRoutes);
app.use('/uploads', express.static(path.resolve('uploads')));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Lỗi hệ thống.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
