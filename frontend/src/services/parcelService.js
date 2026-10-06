import { apiFetch, ApiError } from './apiClient.js';

/** Service Layer — page เรียกฟังก์ชันเหล่านี้ ไม่เรียก fetch เอง */

export { ApiError };

export function getBuildings() {
  return apiFetch('/api/buildings');
}

export function getParcels({ status } = {}) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiFetch(`/api/parcels${query}`);
}

export async function getParcel(id) {
  try {
    return await apiFetch(`/api/parcels/${encodeURIComponent(id)}`);
  } catch (error) {
    // 404 ไม่ใช่ความผิดพลาดของระบบ — แปลว่าไม่มีพัสดุรหัสนี้
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function createParcel(input) {
  return apiFetch('/api/parcels', { method: 'POST', body: input });
}

export function updateParcelStatus(id, status) {
  return apiFetch(`/api/parcels/${encodeURIComponent(id)}`, { method: 'PUT', body: { status } });
}

export function deleteParcel(id) {
  return apiFetch(`/api/parcels/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
