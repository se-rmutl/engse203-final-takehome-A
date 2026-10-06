import { describe, test, expect } from 'vitest';
import { validateLookup } from './lookup.js';

/**
 * 📋 test สเปกของ FEAT (ห้ามแก้ไฟล์นี้ · ทำโค้ดให้ผ่าน)
 *   ใน starter ทั้ง 2 ข้อ fail เพราะ validateLookup ยังไม่ได้ตรวจอะไร (ตั้งใจ)
 */
describe('FEAT · validateLookup', () => {
  test('เลขห้องไม่มีขีด (A305) → error 1 ข้อ', () => {
    expect(validateLookup({ room: 'A305', last4: '1234' })).toHaveLength(1);
  });
  test('ห้องตัวพิมพ์เล็กใช้ได้ แต่เลขท้ายมีตัวอักษร → error 1 ข้อ', () => {
    expect(validateLookup({ room: 'a-305', last4: '12a4' })).toHaveLength(1);
  });
});
