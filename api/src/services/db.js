import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync } from 'node:fs';
import { config } from '../config.js';

/**
 * db.js — เปิดฐานข้อมูล SQLite ที่เดียว · service อื่นเรียก getDb()
 *
 * loadSeed()
 *   - เปิดไฟล์ตาม config.dbFile (test ใช้ ':memory:' → ได้ฐานข้อมูลใหม่ทุกครั้ง)
 *   - ถ้ายังไม่มีตาราง ให้สร้างจาก schema.sql พร้อมข้อมูลตั้งต้น
 */
let db;

export async function loadSeed() {
  db = new DatabaseSync(config.dbFile);
  db.exec('PRAGMA foreign_keys = ON');   // ⚠ ต้องเปิดทุกครั้งที่เปิดฐานข้อมูล
  const ready = db.prepare(
    "SELECT COUNT(*) c FROM sqlite_master WHERE type='table' AND name='parcels'"
  ).get().c;
  if (!ready && existsSync(config.schemaFile)) {
    db.exec(readFileSync(config.schemaFile, 'utf8'));
  }
}

export function getDb() {
  if (!db) throw new Error('ยังไม่ได้เปิดฐานข้อมูล — เรียก loadSeed() ก่อน');
  return db;
}

/** สถานะฐานข้อมูล — ใช้โดย health check */
export function getDbStatus() {
  try {
    if (!db) return { connected: false, reason: 'ยังไม่ได้เปิดฐานข้อมูล' };
    const n = db.prepare("SELECT COUNT(*) c FROM sqlite_master WHERE type='table'").get().c;
    return { connected: true, driver: 'sqlite', tables: n };
  } catch (e) {
    return { connected: false, reason: e.message };
  }
}
