import { describe, test, expect, vi, afterEach } from 'vitest';
import request from 'supertest';

/**
 * พฤติกรรมตอน production — error ต้องไม่ส่ง stack trace ออกไปให้ผู้ใช้
 */
const ORIGINAL = { ...process.env };
afterEach(() => { process.env = { ...ORIGINAL }; vi.resetModules(); });

describe('production', () => {
  test('error ตอน production ไม่มี stack trace ในคำตอบ', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'test-production-secret';
    vi.resetModules();                                     // โหลด config ใหม่ด้วย env ชุดนี้
    const { createApp } = await import('../../src/app.js');
    const { loadSeed } = await import('../../src/services/db.js');
    await loadSeed();
    const r = await request(createApp()).post('/api/auth/login')
      .set('Content-Type', 'application/json').send('{"broken": ');
    expect(r.status).toBe(400);
    expect(r.body).not.toHaveProperty('stack');
  });
});
