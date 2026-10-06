/**
 * authStore.js — เก็บ token ของเจ้าหน้าที่ฝั่งเบราว์เซอร์
 *
 *   createAuthStore(storage) → { getToken, setToken, clear }
 *     รับ storage เข้ามา (ค่าเริ่มต้น = localStorage ของเบราว์เซอร์)
 *     → ใน test ส่ง fake storage เข้าไปแทนได้ ไม่ต้องมีเบราว์เซอร์
 *
 *   ⚠ localStorage อ่านได้ด้วย JavaScript ทุกตัวในหน้า (XSS)
 *     → ห้ามใช้ dangerouslySetInnerHTML กับข้อมูลผู้ใช้
 */
import { decodeTokenPayload, isTokenExpired } from '../utils/token.js';

export const TOKEN_KEY = 'parcel.token';
const EVENT = 'parcel:auth-changed';

export function createAuthStore(storage = globalThis.localStorage, onChange = () => {}) {
  return {
    getToken() {
      try { return storage?.getItem(TOKEN_KEY) ?? null; } catch { return null; }
    },
    setToken(token) {
      try { storage?.setItem(TOKEN_KEY, token); } catch { /* storage ถูกปิด — ใช้งานต่อได้แต่ไม่จำ */ }
      onChange();
    },
    clear() {
      try { storage?.removeItem(TOKEN_KEY); } catch { /* ignore */ }
      onChange();
    },
  };
}

function notifyChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT));
}

/** instance หลักที่หน้าเว็บใช้ (localStorage จริง) */
export const authStore = createAuthStore(undefined, notifyChange);
export default authStore;

/** ผู้ใช้ปัจจุบันจาก payload ของ token · null = ยังไม่เข้าสู่ระบบ หรือ token หมดอายุ */
export function getCurrentUser(token = authStore.getToken()) {
  if (!token || isTokenExpired(token)) return null;
  return decodeTokenPayload(token);
}

/** ให้ React รู้เมื่อเข้า/ออกจากระบบ (ใช้กับ useSyncExternalStore) */
export function subscribe(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);   // เปิดหลายแท็บ — ออกจากระบบแท็บหนึ่ง อีกแท็บรู้ด้วย
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
