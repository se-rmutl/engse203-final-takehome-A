/**
 * password.js — เก็บรหัสผ่านอย่างปลอดภัยด้วย scrypt (มากับ Node ใน node:crypto)
 *
 * Week 13 · CP49
 *   ❌ ห้ามเก็บรหัสผ่านตรง ๆ — ฐานข้อมูลหลุดเมื่อไร รหัสผ่านทุกคนหลุดทันที
 *   ❌ hash เฉย ๆ (เช่น sha256) ไม่พอ — เร็วเกินไป เดารหัสผ่านทีละล้านครั้งต่อวินาทีได้
 *   ✅ scrypt + salt สุ่ม — ช้าโดยตั้งใจ และรหัสผ่านเดียวกันได้ hash ไม่เหมือนกัน
 *
 * รูปแบบที่เก็บในฐานข้อมูล:  scrypt$<salt 16 ไบต์ hex>$<hash 64 ไบต์ hex>
 *
 * ทำไมไม่ใช้ bcrypt — ต้อง compile native module ซึ่งมักพังบน Windows
 * scrypt อยู่ใน Node แล้ว ไม่ต้องติดตั้งอะไรเพิ่ม (แนวคิดเดียวกับที่เลือก node:sqlite)
 */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

export function hashPassword(plain) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(plain, salt, KEY_LENGTH).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(plain, stored) {
  const [scheme, salt, hashHex] = String(stored ?? '').split('$');
  if (scheme !== 'scrypt' || !salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(String(plain), salt, expected.length);
  // timingSafeEqual ใช้เวลาเท่ากันไม่ว่าจะผิดตัวที่เท่าไร — กันการเดาจากเวลาที่ใช้ตอบ
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
