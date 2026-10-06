import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow dark">DORM PARCEL SERVICE</p>
          <h1>ระบบรับพัสดุหอพัก</h1>
          <p>สำนักงานหอพักรับพัสดุไว้แทนผู้พัก แล้วแจ้งให้มารับที่เคาน์เตอร์</p>
        </div>
      </div>
      <div className="home-grid">
        <article className="panel">
          <h2>สำหรับผู้พัก</h2>
          <p>ตรวจว่ามีพัสดุรออยู่ที่สำนักงานหรือไม่ ด้วยเลขห้องและเลขท้ายพัสดุ 4 หลัก ไม่ต้องเข้าสู่ระบบ</p>
          <Link className="button primary inline" to="/track">ตรวจสอบพัสดุ</Link>
        </article>
        <article className="panel">
          <h2>สำหรับเจ้าหน้าที่</h2>
          <p>ลงทะเบียนพัสดุที่มาถึง เปลี่ยนสถานะเมื่อแจ้งผู้รับหรือผู้รับมารับแล้ว</p>
          <Link className="button secondary inline" to="/staff/parcels">ไปหน้ารายการพัสดุ</Link>
        </article>
      </div>
    </section>
  );
}

export default HomePage;
