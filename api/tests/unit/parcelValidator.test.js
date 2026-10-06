import { describe, test, expect } from 'vitest';
import { validateParcelInput, isValidStatus, normalizeRoom } from '../../src/validators/parcelValidator.js';

/**
 * Unit test — ทดสอบ pure function โดยตรง ไม่ต้องเปิด server ไม่ต้องมีฐานข้อมูล
 * แต่ละ test เปลี่ยนทีละช่องจากข้อมูลที่ถูกต้อง เพื่อให้รู้ว่าพังเพราะอะไร
 */
const buildingIds = [1, 2, 3];
const valid = {
  recipientName: 'ผู้รับ ทดสอบ',
  buildingId: 1,
  room: 'A-305',
  carrier: 'Kerry',
  trackingNo: 'KERDO26007777',
};
const check = (patch) => validateParcelInput({ ...valid, ...patch }, { buildingIds });

describe('validateParcelInput — ข้อมูลถูกต้อง', () => {
  test('ทุกช่องถูกต้อง → ไม่มี error', () => {
    expect(check({})).toEqual([]);
  });
  test('หมายเหตุไม่บังคับ · ใส่ได้ไม่เกิน 500 ตัวอักษร', () => {
    expect(check({ note: 'ก'.repeat(500) })).toEqual([]);
    expect(check({ note: 'ก'.repeat(501) })).toHaveLength(1);
  });
});

describe('validateParcelInput — ชื่อผู้รับ (ค่าขอบ 2 และ 100)', () => {
  test('1 ตัวอักษร → error · 2 ตัวอักษร → ผ่าน', () => {
    expect(check({ recipientName: 'ก' })).toHaveLength(1);
    expect(check({ recipientName: 'กข' })).toEqual([]);
  });
  test('100 ตัวอักษร → ผ่าน · 101 → error', () => {
    expect(check({ recipientName: 'ก'.repeat(100) })).toEqual([]);
    expect(check({ recipientName: 'ก'.repeat(101) })).toHaveLength(1);
  });
});

describe('validateParcelInput — อาคารและเลขห้อง', () => {
  test('อาคารที่ไม่มีอยู่ → "ไม่พบอาคารที่เลือก"', () => {
    expect(check({ buildingId: 99 })).toContain('ไม่พบอาคารที่เลือก');
  });
  test.each(['A305', 'AA-305', 'A-35', '305', ''])('เลขห้อง %j → error', (room) => {
    expect(check({ room })).toContain('เลขห้องต้องอยู่ในรูปแบบ A-305');
  });
  test('ตัวพิมพ์เล็กใช้ได้ (แปลงเป็นตัวพิมพ์ใหญ่ก่อนตรวจ)', () => {
    expect(check({ room: 'b-210' })).toEqual([]);
    expect(normalizeRoom(' b-210 ')).toBe('B-210');
  });
});

describe('validateParcelInput — บริษัทขนส่งและเลขพัสดุ', () => {
  test('บริษัทนอกรายการ → error', () => {
    expect(check({ carrier: 'DHL' })).toContain('บริษัทขนส่งไม่ถูกต้อง');
  });
  test.each([['123456789', 1], ['1234567890', 0], ['1234567890123', 0], ['12345678901234', 1], ['KER-26-00777', 1]])(
    'เลขพัสดุ %j → error %i ข้อ', (trackingNo, n) => {
      expect(check({ trackingNo })).toHaveLength(n);
    });
});

describe('validateParcelInput — ข้อมูลผิดรูปแบบ', () => {
  test.each([null, undefined, 'text', 42, []])('input = %j → error เดียว', (input) => {
    expect(validateParcelInput(input, { buildingIds })).toEqual(['ต้องส่งข้อมูลพัสดุมาด้วย']);
  });
  test('ส่ง object ว่าง → ได้ error ครบทุกช่องที่บังคับ (5 ช่อง)', () => {
    expect(validateParcelInput({}, { buildingIds })).toHaveLength(5);
  });
});

describe('isValidStatus', () => {
  test.each(['arrived', 'notified', 'picked-up', 'returned'])('"%s" → true', (s) => {
    expect(isValidStatus(s)).toBe(true);
  });
  test.each(['picked up', 'lost', '', undefined])('%j → false', (s) => {
    expect(isValidStatus(s)).toBe(false);
  });
});
