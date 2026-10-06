-- ═══════════════════════════════════════════════════════════
-- ระบบรับพัสดุหอพัก (Dorm Parcel Service) — โครงสร้างฐานข้อมูล
-- รันซ้ำได้ (DROP TABLE IF EXISTS) · ได้ฐานข้อมูลพร้อมข้อมูลตั้งต้นทันที
-- ⚠ test ทั้งหมดอิงข้อมูลตั้งต้นชุดนี้ — ห้ามแก้ข้อมูลตั้งต้น
-- ═══════════════════════════════════════════════════════════

PRAGMA foreign_keys = ON;

-- ลบตารางที่อ้างถึงตารางอื่นก่อน (parcels → buildings)
DROP TABLE IF EXISTS parcels;
DROP TABLE IF EXISTS buildings;
DROP TABLE IF EXISTS users;

-- ───────────────────────────────────────────
-- users — บัญชีเจ้าหน้าที่สำนักงานหอพัก (ผู้พักไม่ต้องมีบัญชี)
-- ───────────────────────────────────────────
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('staff')),
  password_hash TEXT NOT NULL      -- เก็บ hash เท่านั้น · ห้ามเก็บรหัสผ่านตรง ๆ
);

-- ───────────────────────────────────────────
-- buildings — อาคารหอพัก
-- ───────────────────────────────────────────
CREATE TABLE buildings (
  id    INTEGER PRIMARY KEY,
  code  TEXT NOT NULL UNIQUE,
  name  TEXT NOT NULL
);

-- ───────────────────────────────────────────
-- parcels — พัสดุที่สำนักงานรับไว้แทนผู้พัก
-- ───────────────────────────────────────────
CREATE TABLE parcels (
  id              TEXT PRIMARY KEY,                       -- PCL-001
  recipient_name  TEXT NOT NULL,
  building_id     INTEGER NOT NULL,
  room            TEXT NOT NULL,                          -- A-305
  carrier         TEXT NOT NULL
                  CHECK (carrier IN ('ไปรษณีย์ไทย','Kerry','Flash','J&T','อื่น ๆ')),
  tracking_no     TEXT NOT NULL,                          -- 10–13 ตัวอักษร/ตัวเลข
  status          TEXT NOT NULL DEFAULT 'arrived'
                  CHECK (status IN ('arrived','notified','picked-up','returned')),
  arrived_at      TEXT NOT NULL DEFAULT (date('now','localtime')),
  note            TEXT,

  FOREIGN KEY (building_id) REFERENCES buildings(id)
);

-- ───────────────────────────────────────────
-- ข้อมูลตั้งต้น
-- ───────────────────────────────────────────
INSERT INTO buildings (id, code, name) VALUES
  (1, 'A', 'หอพักชาย A'),
  (2, 'B', 'หอพักหญิง B'),
  (3, 'C', 'หอพักรวม C');

-- บัญชีเจ้าหน้าที่สำหรับพัฒนาและทดสอบ — office@dorm.rmutl.ac.th / parcel1234 (เก็บเป็น scrypt hash)
-- ⚠ production ต้องสร้างบัญชีใหม่ด้วย npm run create-staff และลบบัญชีนี้
INSERT INTO users (name, email, role, password_hash) VALUES
  ('เจ้าหน้าที่สำนักงานหอพัก', 'office@dorm.rmutl.ac.th', 'staff',
   'scrypt$059651297cac6285833fa932621ad5f8$8360b05fcca0fe84f113b1f5b14a09c433a6d9e4ab865ca24b8e89263460c2d6dc7517bd554a401ca075190ce7646b558e729d5a4b0e205afa2820475117ed7f');

INSERT INTO parcels (id, recipient_name, building_id, room, carrier, tracking_no, status, arrived_at, note) VALUES
  ('PCL-001', 'ธนา มีสุข',      1, 'A-305', 'Kerry',       'KERDO26001234', 'arrived',   '2026-10-05', NULL),
  ('PCL-002', 'วรรณา ศรีงาม',   2, 'B-210', 'ไปรษณีย์ไทย', 'TP2610045678',  'notified',  '2026-10-03', 'กล่องใหญ่ วางไว้หลังเคาน์เตอร์'),
  ('PCL-003', 'ธนา มีสุข',      1, 'A-305', 'Flash',       'TH47010091234', 'picked-up', '2026-09-28', NULL),
  ('PCL-004', 'ปกรณ์ ยิ้มแย้ม',  1, 'A-305', 'J&T',         '820012345678',  'notified',  '2026-10-04', NULL),
  ('PCL-005', 'ชลิตา บุญมา',    3, 'C-118', 'Kerry',       'KERDO26009012', 'returned',  '2026-09-15', 'ไม่มีผู้มารับเกิน 14 วัน ส่งคืนผู้ส่งแล้ว'),
  ('PCL-006', 'อนุชา แก้วใส',   1, 'A-305', 'ไปรษณีย์ไทย', 'TP2610051234',  'notified',  '2026-10-05', NULL),
  ('PCL-007', 'ศิริพร ทองดี',   2, 'B-210', 'Flash',       'TH47010093344', 'picked-up', '2026-09-30', NULL),
  ('PCL-008', 'นภา ดวงดี',      2, 'B-402', 'อื่น ๆ',       'SPX2610081234', 'arrived',   '2026-10-05', 'ซองเอกสาร'),
  ('PCL-009', 'กิตติ พรมมา',    1, 'A-112', 'J&T',         '820012349876',  'arrived',   '2026-10-05', 'ของสด ควรแจ้งผู้รับโดยเร็ว'),
  ('PCL-010', 'ณิชา วงศ์ใหญ่',   3, 'C-201', 'Kerry',       'KERDO26015555', 'picked-up', '2026-10-01', NULL);

CREATE INDEX IF NOT EXISTS idx_parcels_status ON parcels(status);
CREATE INDEX IF NOT EXISTS idx_parcels_room   ON parcels(room);
