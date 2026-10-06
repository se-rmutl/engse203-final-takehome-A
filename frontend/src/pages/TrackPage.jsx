import { Link } from 'react-router-dom';

// TODO(FEAT): หน้าตรวจสอบพัสดุสำหรับผู้พัก — ดูสเปกใน TAKEHOME_A.md
function TrackPage() {
  return (
    <section className="state-card">
      <p className="eyebrow dark">PARCEL LOOKUP</p>
      <h1>ตรวจสอบพัสดุ</h1>
      <p>ยังไม่เปิดให้บริการ</p>
      <Link to="/">กลับหน้าแรก</Link>
    </section>
  );
}

export default TrackPage;
