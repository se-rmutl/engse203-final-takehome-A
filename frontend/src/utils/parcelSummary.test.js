import { describe, test, expect } from 'vitest';
import { summarizeParcels, STATUS_LABELS } from './parcelSummary.js';

// ข้อมูลรูปแบบเดียวกับที่ GET /api/parcels ส่งมา (ดูได้ใน DevTools → Network)
const sample = [
  { id: 'PCL-001', status: 'arrived' },
  { id: 'PCL-002', status: 'notified' },
  { id: 'PCL-003', status: 'picked-up' },
  { id: 'PCL-004', status: 'notified' },
  { id: 'PCL-005', status: 'returned' },
];

describe('summarizeParcels', () => {
  test('นับครบทุกสถานะ และรวม "รอรับ" = arrived + notified', () => {
    expect(summarizeParcels(sample)).toEqual({ total: 5, arrived: 1, notified: 2, pickedUp: 1, returned: 1, waiting: 3 });
  });
  test('รายการว่าง → ทุกค่าเป็น 0', () => {
    expect(summarizeParcels([])).toEqual({ total: 0, arrived: 0, notified: 0, pickedUp: 0, returned: 0, waiting: 0 });
  });
  test('มีป้ายภาษาไทยครบทุกสถานะที่ API ใช้', () => {
    expect(Object.keys(STATUS_LABELS)).toEqual(['arrived', 'notified', 'picked-up', 'returned']);
  });
});
