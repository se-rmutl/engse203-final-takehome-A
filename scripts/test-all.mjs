#!/usr/bin/env node
/**
 * npm test (root) — รัน test ของ api และ frontend "ทั้งคู่เสมอ"
 * ถึง api จะมี test ที่ fail ก็ยังรัน frontend ต่อ แล้วสรุปผลรวมตอนท้าย
 */
import { spawnSync } from 'node:child_process';

const results = [];
for (const dir of ['api', 'frontend']) {
  console.log(`\n▶ npm test --prefix ${dir}\n`);
  const r = spawnSync('npm', ['test', '--prefix', dir], { stdio: 'inherit', shell: true });
  results.push({ dir, ok: r.status === 0 });
}

console.log('\n── สรุป ──');
for (const { dir, ok } of results) console.log(`${ok ? 'ผ่าน' : 'มี test ไม่ผ่าน'} · ${dir}`);
process.exit(results.every((r) => r.ok) ? 0 : 1);
