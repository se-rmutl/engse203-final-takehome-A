#!/usr/bin/env node
/**
 * create-staff.mjs — สร้าง/เปลี่ยนรหัสผ่านบัญชีเจ้าหน้าที่
 *
 *   npm run create-staff -- <อีเมล> <รหัสผ่าน> [ชื่อ]
 *   npm run create-staff -- desk2@dorm.rmutl.ac.th "Str0ng-Pass!" "เจ้าหน้าที่กะดึก"
 *
 * ใช้ hashPassword ตัวเดียวกับระบบ — ฐานข้อมูลเก็บแค่ hash
 */
import { loadSeed } from '../src/services/db.js';
import { upsertStaff } from '../src/services/userService.js';
import { hashPassword } from '../src/utils/password.js';

const [email, password, name = 'เจ้าหน้าที่'] = process.argv.slice(2);
if (!email || !password || password.length < 8) {
  console.error('วิธีใช้: npm run create-staff -- <อีเมล> <รหัสผ่านอย่างน้อย 8 ตัว> [ชื่อ]');
  process.exit(1);
}
await loadSeed();   // สร้างตารางถ้ายังไม่มี
const result = upsertStaff({ email, name, passwordHash: hashPassword(password) });
console.log(result === 'created' ? `  ✓ สร้างบัญชีเจ้าหน้าที่ ${email} แล้ว` : `  ✓ เปลี่ยนรหัสผ่านของ ${email} แล้ว`);
