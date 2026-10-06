import { describe, test, expect } from 'vitest';
import { decodeTokenPayload, isTokenExpired } from './token.js';

// สร้าง token รูปแบบเดียวกับ JWT (ไม่ต้องมีลายเซ็นจริง เพราะฝั่งเบราว์เซอร์ไม่ได้ตรวจลายเซ็น)
const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
const fakeToken = (payload) => `${encode({ alg: 'HS256' })}.${encode(payload)}.signature`;

describe('decodeTokenPayload', () => {
  test('อ่านชื่อภาษาไทยและ role ได้', () => {
    const payload = decodeTokenPayload(fakeToken({ name: 'เจ้าหน้าที่สำนักงานหอพัก', role: 'staff' }));
    expect(payload).toMatchObject({ name: 'เจ้าหน้าที่สำนักงานหอพัก', role: 'staff' });
  });
  test('token เสีย → null (ไม่พัง)', () => {
    expect(decodeTokenPayload('not-a-token')).toBeNull();
  });
});

describe('isTokenExpired', () => {
  const now = 1_700_000_000_000;
  test('ยังไม่หมดอายุ → false', () => {
    expect(isTokenExpired(fakeToken({ exp: now / 1000 + 60 }), now)).toBe(false);
  });
  test('หมดอายุแล้ว → true', () => {
    expect(isTokenExpired(fakeToken({ exp: now / 1000 - 1 }), now)).toBe(true);
  });
  test('ไม่มี exp → ถือว่าหมดอายุ', () => {
    expect(isTokenExpired(fakeToken({ role: 'staff' }), now)).toBe(true);
  });
});
