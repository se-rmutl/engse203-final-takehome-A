/**
 * parcelValidator.js — กฎตรวจข้อมูลพัสดุ เป็น "pure function"
 *   ไม่แตะฐานข้อมูล ไม่รู้จัก req/res → เขียน unit test ได้ทันที
 *   ข้อมูลที่ต้องมาจากฐานข้อมูล (รหัสอาคารที่มีอยู่) ให้ส่งเข้ามาเป็นพารามิเตอร์
 *
 *   validateParcelInput(input, { buildingIds }) → [] ถ้าผ่าน · ['ข้อความ error', ...] ถ้าไม่ผ่าน
 */

export const CARRIERS = ['ไปรษณีย์ไทย', 'Kerry', 'Flash', 'J&T', 'อื่น ๆ'];
export const STATUSES = ['arrived', 'notified', 'picked-up', 'returned'];

export const ROOM_PATTERN = /^[A-Z]-\d{3}$/;           // A-305
export const TRACKING_PATTERN = /^[A-Za-z0-9]{10,13}$/;  // ตัวอักษร/ตัวเลข 10–13 ตัว

export const MIN_NAME = 2;
export const MAX_NAME = 100;
export const MAX_NOTE = 500;

/** เลขห้อง: ตัดช่องว่าง + ตัวพิมพ์ใหญ่ → 'a-305 ' กลายเป็น 'A-305' */
export function normalizeRoom(room) {
  return typeof room === 'string' ? room.trim().toUpperCase() : room;
}

/** ตรวจช่องข้อความหนึ่งช่อง — คืนข้อความ error หรือ null */
function checkText(value, label, { min = 1, max }) {
  if (typeof value !== 'string') return `${label}ต้องเป็นข้อความ`;
  const length = value.trim().length;
  if (length < min) return min > 1 ? `${label}ต้องมีอย่างน้อย ${min} ตัวอักษร` : `กรุณาระบุ${label}`;
  if (length > max) return `${label}ต้องไม่เกิน ${max} ตัวอักษร`;
  return null;
}

function checkBuilding(buildingId, buildingIds) {
  if (!Number.isInteger(buildingId)) return 'กรุณาเลือกอาคาร';
  return buildingIds.includes(buildingId) ? null : 'ไม่พบอาคารที่เลือก';
}

function checkNote(note) {
  if (note === undefined || note === null || note === '') return null;
  if (typeof note !== 'string') return 'หมายเหตุต้องเป็นข้อความ';
  return note.trim().length > MAX_NOTE ? `หมายเหตุต้องไม่เกิน ${MAX_NOTE} ตัวอักษร` : null;
}

export function validateParcelInput(input, { buildingIds = [] } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return ['ต้องส่งข้อมูลพัสดุมาด้วย'];
  }

  const errors = [
    checkText(input.recipientName, 'ชื่อผู้รับ', { min: MIN_NAME, max: MAX_NAME }),
    checkBuilding(input.buildingId, buildingIds),
    ROOM_PATTERN.test(normalizeRoom(input.room) ?? '') ? null : 'เลขห้องต้องอยู่ในรูปแบบ A-305',
    CARRIERS.includes(input.carrier) ? null : 'บริษัทขนส่งไม่ถูกต้อง',
    typeof input.trackingNo === 'string' && TRACKING_PATTERN.test(input.trackingNo.trim())
      ? null
      : 'เลขพัสดุต้องเป็นตัวอักษรหรือตัวเลข 10–13 ตัว',
    checkNote(input.note),
  ];
  return errors.filter(Boolean);
}

/** สถานะที่ PUT /api/parcels/:id รับได้ */
export function isValidStatus(status) {
  return STATUSES.includes(status);
}

/** ข้อมูลเข้าสู่ระบบ — ตรวจแค่รูปแบบ ส่วนถูกหรือผิดให้ authService ตัดสิน */
export function validateLoginInput(input) {
  if (!input || typeof input !== 'object') return ['ต้องส่งอีเมลและรหัสผ่าน'];
  const errors = [];
  if (typeof input.email !== 'string' || !input.email.includes('@') || input.email.length > 254) {
    errors.push('รูปแบบอีเมลไม่ถูกต้อง');
  }
  if (typeof input.password !== 'string' || input.password.length === 0 || input.password.length > 200) {
    errors.push('กรุณาระบุรหัสผ่าน');
  }
  return errors;
}
