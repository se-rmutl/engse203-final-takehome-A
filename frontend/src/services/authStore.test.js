import { describe, test, expect } from 'vitest';
import { createAuthStore, TOKEN_KEY } from './authStore.js';

/**
 * ทดสอบ authStore โดยไม่ต้องมีเบราว์เซอร์ — ส่ง "fake storage" เข้าไปแทน localStorage
 * fake storage มีเมธอดเหมือน localStorage: getItem · setItem · removeItem
 */
function fakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => { data.set(key, String(value)); },
    removeItem: (key) => { data.delete(key); },
  };
}

describe('createAuthStore', () => {
  test('setToken แล้ว getToken ได้ค่าเดิม · เก็บไว้ใต้ TOKEN_KEY', () => {
    const storage = fakeStorage();
    const store = createAuthStore(storage);
    store.setToken('abc.def.ghi');
    expect(store.getToken()).toBe('abc.def.ghi');
    expect(storage.getItem(TOKEN_KEY)).toBe('abc.def.ghi');
  });
  test('clear แล้วไม่มี token', () => {
    const store = createAuthStore(fakeStorage({ [TOKEN_KEY]: 'abc' }));
    store.clear();
    expect(store.getToken()).toBeNull();
  });
  test('storage ใช้ไม่ได้ (โยน error) → getToken คืน null ไม่พัง', () => {
    const broken = { getItem: () => { throw new Error('blocked'); } };
    expect(createAuthStore(broken).getToken()).toBeNull();
  });
});
