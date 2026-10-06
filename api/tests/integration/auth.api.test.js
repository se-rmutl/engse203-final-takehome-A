import { describe, test, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { config } from '../../src/config.js';
import { loadSeed } from '../../src/services/db.js';
import { resetLoginLimiter } from '../../src/routes/authRoutes.js';
import { STAFF, loginAsStaff, tokenFor } from '../helpers/auth.js';

/**
 * เข้าสู่ระบบและสิทธิ์
 *   POST /api/auth/login · 401 (ไม่รู้ว่าเป็นใคร) · 403 (รู้แต่ไม่มีสิทธิ์)
 */
const app = createApp();
beforeEach(async () => { await loadSeed(); resetLoginLimiter(); });

describe('POST /api/auth/login', () => {
  test('อีเมลและรหัสผ่านถูก → 200 พร้อม token และข้อมูลผู้ใช้', async () => {
    const r = await request(app).post('/api/auth/login').send(STAFF);
    expect(r.status).toBe(200);
    expect(r.body.token.split('.')).toHaveLength(3);          // header.payload.signature
    expect(r.body.user).toMatchObject({ role: 'staff' });
    expect(r.body.user).not.toHaveProperty('passwordHash');
  });
  test('payload ของ token มี role และวันหมดอายุ แต่ไม่มีรหัสผ่าน', async () => {
    const payload = jwt.decode(await loginAsStaff(app));     // decode ได้ทุกคน — แต่แก้ไม่ได้
    expect(payload).toMatchObject({ role: 'staff' });
    expect(payload.exp).toBeGreaterThan(payload.iat);
    expect(JSON.stringify(payload)).not.toMatch(/parcel1234|scrypt/);
  });
  test('รหัสผ่านผิด กับ อีเมลที่ไม่มี → 401 ข้อความเดียวกัน', async () => {
    const wrong = await request(app).post('/api/auth/login').send({ ...STAFF, password: 'nope1234' });
    const unknown = await request(app).post('/api/auth/login').send({ email: 'ghost@dorm.rmutl.ac.th', password: 'nope1234' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.error).toBe(unknown.body.error);
  });
  test('ไม่ส่งรหัสผ่าน → 400', async () => {
    const r = await request(app).post('/api/auth/login').send({ email: STAFF.email });
    expect(r.status).toBe(400);
  });
  test('ผิดเกิน 5 ครั้ง → 429', async () => {
    for (let i = 0; i < 5; i += 1) {
      await request(app).post('/api/auth/login').send({ ...STAFF, password: `wrong-${i}` }).expect(401);
    }
    const r = await request(app).post('/api/auth/login').send(STAFF);
    expect(r.status).toBe(429);
  });
});

describe('สิทธิ์ของ endpoint เจ้าหน้าที่', () => {
  const put = () => request(app).put('/api/parcels/PCL-001').send({ status: 'notified' });
  test('ดูรายการพัสดุโดยไม่มี token → 401', async () => {
    const r = await request(app).get('/api/parcels');
    expect(r.status).toBe(401);
    expect(r.headers['www-authenticate']).toMatch(/Bearer/);
  });
  test('ลงทะเบียนพัสดุโดยไม่มี token → 401', async () => {
    const r = await request(app).post('/api/parcels').send({});
    expect(r.status).toBe(401);
  });
  test('token ที่เซ็นด้วย secret อื่น (ปลอม) → 401', async () => {
    const r = await put().set('Authorization', `Bearer ${tokenFor('staff', 'not-the-real-secret')}`);
    expect(r.status).toBe(401);
  });
  test('token หมดอายุ → 401', async () => {
    const expired = jwt.sign({ sub: '1', role: 'staff', exp: Math.floor(Date.now() / 1000) - 60 }, config.jwtSecret);
    const r = await put().set('Authorization', `Bearer ${expired}`);
    expect(r.status).toBe(401);
  });
  test('token ถูกต้องแต่ไม่ใช่เจ้าหน้าที่ → 403', async () => {
    const r = await put().set('Authorization', `Bearer ${tokenFor('resident')}`);
    expect(r.status).toBe(403);
  });
  test('เจ้าหน้าที่ → PUT 200 และ DELETE 204', async () => {
    const auth = `Bearer ${await loginAsStaff(app)}`;
    await put().set('Authorization', auth).expect(200);
    await request(app).delete('/api/parcels/PCL-002').set('Authorization', auth).expect(204);
  });
  test('รายชื่ออาคาร (GET /api/buildings) ไม่ต้องเข้าสู่ระบบ', async () => {
    await request(app).get('/api/buildings').expect(200);
  });
});

describe('ข้อมูลอันตราย', () => {
  test('body ใหญ่เกิน 10kb → 413 เป็น JSON', async () => {
    const r = await request(app).post('/api/auth/login').send({ email: 'x@y.z', password: 'x'.repeat(20000) });
    expect(r.status).toBe(413);
    expect(r.body.error).toMatch(/ขนาดใหญ่เกิน/);
  });
  test('ทุกคำตอบมี security header', async () => {
    const r = await request(app).get('/api/health');
    expect(r.headers['x-content-type-options']).toBe('nosniff');
    expect(r.headers['x-frame-options']).toBe('DENY');
  });
});
