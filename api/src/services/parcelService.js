import { getDb } from './db.js';
import { normalizeRoom } from '../validators/parcelValidator.js';

/**
 * parcelService.js — จัดการข้อมูลพัสดุ
 *
 * ฐานข้อมูลเก็บ snake_case และ building_id (ตัวเลข)
 * แต่ API ส่ง camelCase และ buildingName (ชื่ออาคาร)
 * → ใช้ JOIN + AS แปลงให้ตรงกันที่นี่ (หน้าที่ของ service)
 */
const SELECT_SHAPE = `
  SELECT p.id,
         p.recipient_name AS recipientName,
         p.building_id    AS buildingId,
         b.name           AS buildingName,
         p.room,
         p.carrier,
         p.tracking_no    AS trackingNo,
         p.status,
         p.arrived_at     AS arrivedAt,
         p.note
  FROM parcels p
  JOIN buildings b ON b.id = p.building_id`;

export function findAll({ status } = {}) {
  const db = getDb();
  return status
    ? db.prepare(`${SELECT_SHAPE} WHERE p.status = status ORDER BY p.id`).all()
    : db.prepare(`${SELECT_SHAPE} ORDER BY p.id`).all();
}

export function findById(id) {
  return getDb().prepare(`${SELECT_SHAPE} WHERE p.id = ?`).get(id) ?? null;
}

/** รหัสพัสดุถัดไป เช่น PCL-011 — ต่อจากรหัสล่าสุด (ไม่ใช้ COUNT เพราะลบแล้วรหัสจะชน) */
function nextId() {
  const row = getDb().prepare(
    "SELECT id FROM parcels WHERE id LIKE 'PCL-%' ORDER BY id DESC LIMIT 1"
  ).get();
  const n = row ? Number(String(row.id).replace('PCL-', '')) + 1 : 1;
  return `PCL-${String(n).padStart(3, '0')}`;
}

function cleanNote(note) {
  if (typeof note !== 'string') return null;
  const trimmed = note.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** ลงทะเบียนพัสดุใหม่ — สถานะเริ่มต้น arrived · วันที่รับ = วันนี้ */
export function create(input) {
  const id = nextId();
  getDb().prepare(
    `INSERT INTO parcels (id, recipient_name, building_id, room, carrier, tracking_no, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.recipientName.trim(),
    input.buildingId,
    normalizeRoom(input.room),
    input.carrier,
    input.trackingNo.trim().toUpperCase(),
    cleanNote(input.note),
  );
  return findById(id);
}

export function updateStatus(id, status) {
  const result = getDb().prepare('UPDATE parcels SET status = ? WHERE id = ?').run(status, id);
  return result.changes ? findById(id) : null;
}

export function remove(id) {
  const target = findById(id);
  if (!target) return null;
  getDb().prepare('DELETE FROM parcels WHERE id = ?').run(id);
  return target;
}
