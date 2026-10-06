import { apiFetch } from './apiClient.js';
import { authStore } from './authStore.js';

/** เข้าสู่ระบบ → เก็บ token · คืนข้อมูลผู้ใช้ */
export async function login(email, password) {
  const result = await apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });
  authStore.setToken(result.token);
  return result.user;
}

export function logout() {
  authStore.clear();
}
