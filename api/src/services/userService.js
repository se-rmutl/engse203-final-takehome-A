import { getDb } from './db.js';

/** หาบัญชีจากอีเมล (ใช้ตอนเข้าสู่ระบบ) · คืน password_hash ให้ authService ตรวจ */
export function findUserByEmail(email) {
  return getDb().prepare(
    'SELECT id, name, email, role, password_hash AS passwordHash FROM users WHERE email = ?'
  ).get(String(email).trim().toLowerCase()) ?? null;
}

/** สร้างหรือเปลี่ยนรหัสผ่านบัญชีเจ้าหน้าที่ (ใช้โดย scripts/create-staff.mjs) */
export function upsertStaff({ email, name, passwordHash }) {
  const normalized = String(email).trim().toLowerCase();
  if (findUserByEmail(normalized)) {
    getDb().prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(passwordHash, normalized);
    return 'updated';
  }
  getDb().prepare("INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, 'staff', ?)")
    .run(name, normalized, passwordHash);
  return 'created';
}
