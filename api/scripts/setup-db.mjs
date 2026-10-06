#!/usr/bin/env node
/**
 * setup-db.mjs — สร้างฐานข้อมูลจาก schema.sql
 *
 *   npm run db:setup            สร้าง api/data/parcel.db (ถ้ามีอยู่แล้วจะไม่ทำอะไร)
 *   npm run db:reset            ลบของเดิมแล้วสร้างใหม่จากข้อมูลตั้งต้น
 */
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync, unlinkSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// อ้างจากตำแหน่งไฟล์นี้ ไม่ใช่จากที่รันคำสั่ง
const HERE = path.dirname(fileURLToPath(import.meta.url));
const API_ROOT = path.resolve(HERE, '..');
const DB_FILE = process.env.DB_FILE
  ? path.resolve(process.cwd(), process.env.DB_FILE)
  : path.join(API_ROOT, 'data', 'parcel.db');
const SCHEMA_FILE = path.join(API_ROOT, 'data', 'schema.sql');
const FORCE = process.argv.includes('--force');

console.log('');
console.log('  ฐานข้อมูล :', DB_FILE);
console.log('  schema    :', SCHEMA_FILE);
console.log('');

if (existsSync(DB_FILE)) {
  if (!FORCE) {
    console.log('  • มีฐานข้อมูลอยู่แล้ว — ไม่ทำอะไร');
    console.log('    ถ้าต้องการเริ่มใหม่จากข้อมูลตั้งต้น:  npm run db:reset');
    console.log('');
    process.exit(0);
  }
  unlinkSync(DB_FILE);
  console.log('  • ลบฐานข้อมูลเดิมแล้ว (--force)');
}

mkdirSync(path.dirname(DB_FILE), { recursive: true });
const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA foreign_keys = ON');

try {
  db.exec(readFileSync(SCHEMA_FILE, 'utf8'));
} catch (err) {
  console.error('  ✕ รัน schema.sql ไม่สำเร็จ:', err.message);
  process.exit(1);
}

const tables = db.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
).all().map((r) => r.name);

console.log('  ✓ สร้างฐานข้อมูลสำเร็จ');
console.log('');
for (const t of tables) {
  const n = db.prepare(`SELECT COUNT(*) c FROM "${t}"`).get().c;
  console.log(`    ${t.padEnd(12)} ${String(n).padStart(3)} แถว`);
}
const fk = db.prepare('PRAGMA foreign_key_list(parcels)').all();
console.log('');
console.log(fk.length
  ? `  ✓ Foreign Key: parcels.${fk[0].from} → ${fk[0].table}.${fk[0].to}`
  : '  ⚠ ไม่พบ Foreign Key ใน parcels — ตรวจ schema.sql');
console.log('');
