import { getDb } from './db.js';

/** อาคารหอพักทั้งหมด — ใช้เติมตัวเลือกในฟอร์มลงทะเบียนพัสดุ */
export function listBuildings() {
  return getDb().prepare('SELECT id, code, name FROM buildings ORDER BY id').all();
}

/** รหัสอาคารที่มีอยู่จริง — ให้ validator ตรวจ buildingId */
export function listBuildingIds() {
  return listBuildings().map((b) => b.id);
}
