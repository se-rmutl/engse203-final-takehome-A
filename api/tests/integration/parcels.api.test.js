import { describe, test, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { loadSeed } from '../../src/services/db.js';
import { loginAsStaff } from '../helpers/auth.js';

/**
 * Integration test — ยิง HTTP จริงผ่านทุกชั้น: route → controller → service → SQLite
 * beforeEach เรียก loadSeed() ใหม่ทุกข้อ → ได้ฐานข้อมูลในหน่วยความจำชุดใหม่ (พัสดุ 10 รายการ)
 */
const app = createApp();
let auth;   // endpoint พัสดุเป็นของเจ้าหน้าที่ → ต้องมี token
beforeEach(async () => {
  await loadSeed();
  auth = { Authorization: `Bearer ${await loginAsStaff(app)}` };
});

const valid = {
  recipientName: 'ผู้รับ ทดสอบ',
  buildingId: 2,
  room: 'B-305',
  carrier: 'Flash',
  trackingNo: 'TH47010097777',
};

describe('GET /api/parcels', () => {
  test('คืน array 10 รายการจากข้อมูลตั้งต้น พร้อม 200', async () => {
    const r = await request(app).get('/api/parcels').set(auth);
    expect(r.status).toBe(200);
    expect(r.body).toHaveLength(10);
  });
  test('รูปแบบ camelCase · มี buildingName ไม่มี building_id', async () => {
    const r = await request(app).get('/api/parcels').set(auth);
    expect(Object.keys(r.body[0]).sort()).toEqual(
      ['arrivedAt', 'buildingId', 'buildingName', 'carrier', 'id', 'note', 'recipientName', 'room', 'status', 'trackingNo'],
    );
    expect(r.body[0].buildingName).toBe('หอพักชาย A');
  });
  test('ส่ง ?status= ได้ → 200 และมีพัสดุสถานะนั้นในผลลัพธ์', async () => {
    const r = await request(app).get('/api/parcels?status=arrived').set(auth);
    expect(r.status).toBe(200);
    expect(r.body.some((p) => p.status === 'arrived')).toBe(true);
  });
});

describe('GET /api/parcels/:id', () => {
  test('พบ → 200', async () => {
    const r = await request(app).get('/api/parcels/PCL-001').set(auth);
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ id: 'PCL-001', room: 'A-305', status: 'arrived' });
  });
  test('ไม่พบ → 404', async () => {
    const r = await request(app).get('/api/parcels/PCL-999').set(auth);
    expect(r.status).toBe(404);
  });
});

describe('POST /api/parcels', () => {
  test('ข้อมูลถูกต้อง → 201 · ได้รหัสถัดไป · สถานะเริ่มต้น arrived', async () => {
    const r = await request(app).post('/api/parcels').set(auth).send(valid);
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({ id: 'PCL-011', status: 'arrived', buildingName: 'หอพักหญิง B', note: null });
    expect(r.body.arrivedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  test('เลขห้องตัวพิมพ์เล็ก → บันทึกเป็นตัวพิมพ์ใหญ่', async () => {
    const r = await request(app).post('/api/parcels').set(auth).send({ ...valid, room: 'b-305' });
    expect(r.body.room).toBe('B-305');
  });
  test('ข้อมูลไม่ครบ → 400 พร้อมรายการ errors', async () => {
    const r = await request(app).post('/api/parcels').set(auth).send({ recipientName: 'x' });
    expect(r.status).toBe(400);
    expect(Array.isArray(r.body.errors)).toBe(true);
    expect(r.body.errors.length).toBeGreaterThan(1);
  });
  test('อาคารที่ไม่มีอยู่ → 400', async () => {
    const r = await request(app).post('/api/parcels').set(auth).send({ ...valid, buildingId: 9 });
    expect(r.status).toBe(400);
    expect(r.body.errors).toContain('ไม่พบอาคารที่เลือก');
  });
  test('ลบรายการกลาง แล้วเพิ่มใหม่ → รหัสไม่ซ้ำของเดิม', async () => {
    await request(app).delete('/api/parcels/PCL-004').set(auth).expect(204);
    const r = await request(app).post('/api/parcels').set(auth).send(valid);
    expect(r.status).toBe(201);
    const ids = (await request(app).get('/api/parcels').set(auth)).body.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('PUT /api/parcels/:id', () => {
  test('เปลี่ยนสถานะ → 200 และค่าใหม่ถูกบันทึก', async () => {
    const r = await request(app).put('/api/parcels/PCL-001').set(auth).send({ status: 'notified' });
    expect(r.status).toBe(200);
    expect(r.body.status).toBe('notified');
    const again = await request(app).get('/api/parcels/PCL-001').set(auth);
    expect(again.body.status).toBe('notified');
  });
  test('สถานะนอกรายการ → 400', async () => {
    const r = await request(app).put('/api/parcels/PCL-001').set(auth).send({ status: 'lost' });
    expect(r.status).toBe(400);
  });
  test('พัสดุที่ไม่มีอยู่ → 404', async () => {
    const r = await request(app).put('/api/parcels/PCL-999').set(auth).send({ status: 'notified' });
    expect(r.status).toBe(404);
  });
});

describe('DELETE /api/parcels/:id', () => {
  test('ลบแล้ว GET ซ้ำ → 404', async () => {
    await request(app).delete('/api/parcels/PCL-003').set(auth).expect(204);
    await request(app).get('/api/parcels/PCL-003').set(auth).expect(404);
  });
  test('ลบรายการที่ไม่มี → 404', async () => {
    await request(app).delete('/api/parcels/PCL-999').set(auth).expect(404);
  });
});

describe('อาคาร · health · เส้นทางที่ไม่มีอยู่', () => {
  test('GET /api/buildings → 3 อาคาร', async () => {
    const r = await request(app).get('/api/buildings');
    expect(r.status).toBe(200);
    expect(r.body.map((b) => b.code)).toEqual(['A', 'B', 'C']);
  });
  test('health บอกว่าต่อฐานข้อมูลได้', async () => {
    const r = await request(app).get('/api/health');
    expect(r.status).toBe(200);
    expect(r.body.database.connected).toBe(true);
  });
  test('GET /api/nope → 404 เป็น JSON', async () => {
    const r = await request(app).get('/api/nope');
    expect(r.status).toBe(404);
    expect(r.body.error).toMatch(/ไม่พบเส้นทาง/);
  });
  test('ส่ง JSON ที่เสีย → 400 เป็น JSON ไม่ใช่ 500', async () => {
    const r = await request(app).post('/api/auth/login')
      .set('Content-Type', 'application/json').send('{"email": ');
    expect(r.status).toBe(400);
    expect(r.body).toHaveProperty('error');
  });
});
