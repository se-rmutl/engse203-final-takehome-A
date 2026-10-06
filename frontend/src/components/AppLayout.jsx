import { NavLink, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { logout } from '../services/authService.js';

const navClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

function AppLayout() {
  const { user, isStaff } = useAuth();
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <div>
            <p className="eyebrow">ENGSE203 · TAKE-HOME A</p>
            <p className="brand">ระบบรับพัสดุหอพัก</p>
          </div>
          <nav aria-label="เมนูหลัก">
            <NavLink className={navClass} to="/" end>หน้าแรก</NavLink>
            <NavLink className={navClass} to="/track">ตรวจสอบพัสดุ</NavLink>
            {isStaff && <NavLink className={navClass} to="/staff/parcels" end>รายการพัสดุ</NavLink>}
            {isStaff && <NavLink className={navClass} to="/staff/parcels/new">ลงทะเบียนพัสดุ</NavLink>}
            {isStaff ? (
              <button className="nav-link as-button" type="button" onClick={logout}>
                ออกจากระบบ ({user.name})
              </button>
            ) : (
              <NavLink className={navClass} to="/login">เจ้าหน้าที่</NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="container page-content" id="main-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">สำนักงานหอพัก · ข้อมูลในระบบนี้เป็นข้อมูลสมมติสำหรับการสอบ</div>
      </footer>
    </div>
  );
}

export default AppLayout;
