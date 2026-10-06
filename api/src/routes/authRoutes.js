import { Router } from 'express';
import * as authService from '../services/authService.js';
import { validateLoginInput } from '../validators/parcelValidator.js';

const router = Router();

// จำกัดการเดารหัสผ่าน: ผิดเกิน 5 ครั้งใน 15 นาที (ต่อ IP + อีเมล) → 429
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
const failures = new Map();
const keyOf = (req) => `${req.ip}|${String(req.body?.email ?? '').toLowerCase()}`;
export function resetLoginLimiter() { failures.clear(); }

router.post('/login', (req, res) => {
  const errors = validateLoginInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง', errors });
  }

  const key = keyOf(req);
  const now = Date.now();
  const record = failures.get(key);
  if (record && now - record.first < WINDOW_MS && record.count >= MAX_FAILS) {
    return res.status(429).json({ error: 'ลองเข้าสู่ระบบผิดหลายครั้งเกินไป กรุณารอสักครู่' });
  }

  const result = authService.login(req.body.email, req.body.password);
  if (!result) {
    const fresh = !record || now - record.first >= WINDOW_MS;
    failures.set(key, fresh ? { first: now, count: 1 } : { ...record, count: record.count + 1 });
    return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
  }

  failures.delete(key);
  res.status(200).json(result);
});

export default router;
