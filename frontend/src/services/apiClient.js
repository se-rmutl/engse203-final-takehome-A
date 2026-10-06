/**
 * apiClient.js — ตัวกลางคุยกับ API · ที่เดียวที่เรียก fetch()
 *
 *   buildHeaders({ storage, json }) — pure function สร้าง header ของทุกคำขอ
 *   apiFetch(path, { method, body }) — เรียก API แล้วคืนข้อมูลที่ parse แล้ว
 */
import { authStore } from './authStore.js';

// dev: API อยู่คนละพอร์ต · production: API เสิร์ฟหน้าเว็บเอง → ใช้ path สัมพัทธ์
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:3001');

/** error ที่รู้ว่ามาจาก API พร้อม status และรายการ error (ถ้ามี) */
export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function buildHeaders({ storage = globalThis.localStorage, json = true } = {}) {
  const headers = json ? { 'Content-Type': 'application/json' } : {};
  let token = null;
  try { token = storage?.getItem('token') ?? null; } catch { token = null; }
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function readError(response) {
  try {
    const body = await response.json();
    const errors = Array.isArray(body.errors) ? body.errors : [];
    return { message: errors.join(' · ') || body.error || `คำขอไม่สำเร็จ (${response.status})`, errors };
  } catch {
    return { message: `คำขอไม่สำเร็จ (${response.status})`, errors: [] };
  }
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  if (!window.location.hash.startsWith('#/login')) window.location.hash = '#/login?reason=expired';
}

/**
 * - ตอบ 2xx → คืนข้อมูล (204 คืน null เพราะไม่มี body)
 * - ตอบ 401 → token ใช้ไม่ได้แล้ว: ล้าง token แล้วพาไปหน้าเข้าสู่ระบบ
 * - ตอบ 4xx/5xx อื่น → โยน ApiError พร้อม status
 * - ต่อ API ไม่ได้เลย → โยน ApiError status 0
 */
export async function apiFetch(path, { method = 'GET', body } = {}) {
  const hasBody = body !== undefined;
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: buildHeaders({ json: hasBody }),
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('ติดต่อเซิร์ฟเวอร์ไม่ได้ — ตรวจว่าเปิด API ที่พอร์ต 3001 แล้วหรือยัง', 0);
  }

  if (!response.ok) {
    const { message, errors } = await readError(response);
    if (response.status === 401 && path !== '/api/auth/login') {
      authStore.clear();
      redirectToLogin();
    }
    throw new ApiError(message, response.status, errors);
  }

  if (response.status === 204) return null;
  return response.json();
}
