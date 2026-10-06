/**
 * lookup.js — ตรวจข้อมูลค้นหาพัสดุของผู้พัก ก่อนส่งไป API (FEAT)
 *
 *   validateLookup({ room, last4 }) → [] ถ้าผ่าน · ['ข้อความ error ภาษาไทย', ...] ถ้าไม่ผ่าน
 *
 * กติกาดูใน TAKEHOME_A.md หัวข้อ FEAT (ต้องตรงกับที่ API ตรวจ)
 */
export function validateLookup({ room, last4 } = {}) {
  // TODO(FEAT): ตรวจเลขห้องและเลขท้ายพัสดุ 4 หลัก แล้วคืน array ข้อความ error
  return [];
}
