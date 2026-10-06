import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { login } from '../services/authService.js';

/** หน้าเข้าสู่ระบบของเจ้าหน้าที่ — ผู้พักไม่ต้องเข้าสู่ระบบ */
function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isStaff } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isStaff) return <Navigate to="/staff/parcels" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
      navigate('/staff/parcels');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow dark">STAFF ONLY</p>
          <h1>เข้าสู่ระบบเจ้าหน้าที่</h1>
          <p>ลงทะเบียนและจัดการพัสดุได้หลังเข้าสู่ระบบ</p>
        </div>
      </div>
      {searchParams.get('reason') === 'expired' && (
        <p className="notice warn" role="status">กรุณาเข้าสู่ระบบอีกครั้ง</p>
      )}
      <form className="panel form-grid" onSubmit={handleSubmit} noValidate>
        <label>อีเมล
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>รหัสผ่าน
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="field-error" role="alert">{error}</p>}
        <button className="button primary" type="submit" disabled={submitting}>
          {submitting ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </section>
  );
}

export default LoginPage;
