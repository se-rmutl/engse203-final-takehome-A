import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { config } from './config.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import buildingRoutes from './routes/buildingRoutes.js';
import parcelRoutes from './routes/parcelRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // ① CORS — dev: frontend (5173) เรียก API (3001) ข้ามพอร์ต
  app.use(cors({ origin: config.corsOrigin }));

  // ② logging — test ไม่ต้อง log ทุกคำขอ ผลการทดสอบจะได้อ่านง่าย
  if (config.env !== 'test') app.use(morgan(config.isProd ? 'combined' : 'dev'));

  // ③ อ่าน JSON body — ใหญ่เกิน 10kb ได้ 413
  app.use(express.json({ limit: '10kb' }));

  // ④ security headers พื้นฐาน
  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
    });
    next();
  });

  // ⑤ route ของ API — ทุกอย่างอยู่ใต้ /api
  app.get('/api', (req, res) => {
    res.json({ message: 'Dorm Parcel API is running', version: '1.0.0' });
  });
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/buildings', buildingRoutes);
  app.use('/api/parcels', parcelRoutes);

  // ⑥ หน้าเว็บ — production เสิร์ฟไฟล์ที่ build แล้ว · dev ตอบข้อความบอกทาง
  if (config.isProd && existsSync(config.staticDir)) {
    app.use(express.static(config.staticDir));
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(config.staticDir, 'index.html'));
    });
  } else {
    app.get('/', (req, res) => {
      res.json({ message: 'Dorm Parcel API (dev) — หน้าเว็บอยู่ที่ Vite พอร์ต 5173', api: '/api' });
    });
  }

  // ⑦ ปิดท้าย — ต้องอยู่หลังสุดเสมอ
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
