import { useSyncExternalStore } from 'react';
import { authStore, getCurrentUser, subscribe } from '../services/authStore.js';

/**
 * ผู้ใช้ปัจจุบัน — component ที่เรียก hook นี้จะ render ใหม่เมื่อเข้า/ออกจากระบบ
 * คืน { user, isStaff }
 */
export default function useAuth() {
  const token = useSyncExternalStore(subscribe, () => authStore.getToken(), () => null);
  const user = getCurrentUser(token);
  return { user, isStaff: user?.role === 'staff' };
}
