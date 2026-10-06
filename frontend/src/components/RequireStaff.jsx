import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

/**
 * ห่อหน้าของเจ้าหน้าที่ — ยังไม่เข้าสู่ระบบ → ไปหน้า login
 * ⚠ แค่ซ่อนหน้าจอ ไม่ใช่การป้องกันจริง · การป้องกันจริงอยู่ที่ API (authenticate + requireRole)
 */
function RequireStaff({ children }) {
  const { isStaff } = useAuth();
  if (!isStaff) return <Navigate to="/login" replace />;
  return children;
}

export default RequireStaff;
