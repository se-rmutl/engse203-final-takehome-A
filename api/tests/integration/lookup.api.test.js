import { describe, test, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { loadSeed } from '../../src/services/db.js';

/**
 * 📋 test สเปกของ FEAT — ตรวจสอบพัสดุสำหรับผู้พัก (ห้ามแก้ไฟล์นี้ · ทำโค้ดให้ผ่าน)
 *   GET /api/parcels/lookup?room=A-305&last4=1234  — ไม่ต้องมี token
 *   ใน starter ทั้ง 3 ข้อ fail เพราะยังไม่มีฟีเจอร์นี้ (ตั้งใจ)
 */
const app = createApp();
beforeEach(async () => { await loadSeed(); });

describe('FEAT · GET /api/parcels/lookup', () => {
  test('ห้องและเลขท้ายตรง → 200 เฉพาะพัสดุที่ยังรอรับ (arrived / notified)', async () => {
    const r = await request(app).get('/api/parcels/lookup?room=A-305&last4=1234');
    expect(r.status).toBe(200);
    expect(r.body.length).toBeGreaterThan(0);
    expect(r.body.every((p) => ['arrived', 'notified'].includes(p.status))).toBe(true);
  });

  test('ไม่ต้องมี token และไม่ส่งชื่อผู้รับกลับไป', async () => {
    const r = await request(app).get('/api/parcels/lookup?room=A-305&last4=1234');
    expect(r.status).not.toBe(401);
    expect(r.status).toBe(200);
    for (const p of r.body) expect(p).not.toHaveProperty('recipientName');
  });

  test('เลขท้ายไม่ใช่ตัวเลข 4 หลัก → 400 พร้อม errors', async () => {
    const r = await request(app).get('/api/parcels/lookup?room=A-305&last4=12a4');
    expect(r.status).toBe(400);
    expect(Array.isArray(r.body.errors)).toBe(true);
    expect(r.body.errors.length).toBeGreaterThan(0);
  });
});
