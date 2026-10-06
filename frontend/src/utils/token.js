/**
 * token.js — อ่าน payload ของ JWT ฝั่งเบราว์เซอร์ (pure function · ทดสอบได้)
 *
 * ⚠ แค่ "อ่าน" เพื่อแสดงชื่อและซ่อน/แสดงปุ่ม — ไม่ได้ "ตรวจ" ว่า token จริง
 *   การตรวจจริงเกิดที่ API ทุกครั้ง (middleware authenticate) เพราะฝั่งเบราว์เซอร์แก้โค้ดได้เสมอ
 */
export function decodeTokenPayload(token) {
  try {
    const part = String(token).split('.')[1];
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenExpired(token, now = Date.now()) {
  const payload = decodeTokenPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= now;
}
