import { Router } from 'express';
import { getDbStatus } from '../services/db.js';
import { config } from '../config.js';

/**
 * GET /api/health — ระบบบอกสถานะตัวเอง
 *   ตอน deploy จริง cloud จะเรียก endpoint นี้เพื่อเช็คว่า API เปิดอยู่และต่อฐานข้อมูลได้
 */
const router = Router();

router.get('/', (req, res) => {
  const db = getDbStatus();
  const ok = db.connected;
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    env: config.env,
    uptime: Math.round(process.uptime()),
    database: db,
    time: new Date().toISOString(),
  });
});

export default router;
