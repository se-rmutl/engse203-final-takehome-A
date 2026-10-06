import { describe, test, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/utils/password.js';

// hash ของ "parcel1234" ที่อยู่ใน schema.sql — โค้ดเราต้องตรวจ hash นี้ผ่าน
const SEED_HASH = 'scrypt$059651297cac6285833fa932621ad5f8$8360b05fcca0fe84f113b1f5b14a09c433a6d9e4ab865ca24b8e89263460c2d6dc7517bd554a401ca075190ce7646b558e729d5a4b0e205afa2820475117ed7f';

describe('hashPassword', () => {
  test('รูปแบบ scrypt$salt$hash', () => {
    expect(hashPassword('secret-1')).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  });
  test('รหัสผ่านเดียวกัน hash 2 ครั้ง ได้ไม่เหมือนกัน (salt สุ่ม)', () => {
    expect(hashPassword('secret-1')).not.toBe(hashPassword('secret-1'));
  });
  test('hash ไม่มีรหัสผ่านตัวจริงปนอยู่', () => {
    expect(hashPassword('secret-1')).not.toContain('secret-1');
  });
});

describe('verifyPassword', () => {
  test('รหัสผ่านถูก → true', () => {
    expect(verifyPassword('secret-1', hashPassword('secret-1'))).toBe(true);
  });
  test('รหัสผ่านผิด → false', () => {
    expect(verifyPassword('secret-2', hashPassword('secret-1'))).toBe(false);
  });
  test('ตรวจ hash ของบัญชีเจ้าหน้าที่ใน schema.sql ได้', () => {
    expect(verifyPassword('parcel1234', SEED_HASH)).toBe(true);
  });
  test.each([undefined, '', 'plain-text', 'md5$abc$def'])('hash ผิดรูปแบบ %j → false (ไม่พัง)', (stored) => {
    expect(verifyPassword('parcel1234', stored)).toBe(false);
  });
});
