import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge.jsx';
import StatusFilter from '../components/StatusFilter.jsx';
import SummaryPanel from '../components/SummaryPanel.jsx';
import { getParcels } from '../services/parcelService.js';
import { summarizeParcels } from '../utils/parcelSummary.js';

function ParcelListPage() {
  const [status, setStatus] = useState('');
  const [parcels, setParcels] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  // กรองที่ API (GET /api/parcels?status=...) — หน้าเว็บแสดงตามที่ API ส่งมา
  useEffect(() => {
    let ignore = false;
    setLoadState('loading');
    getParcels({ status }).then((data) => {
      if (ignore) return;
      setParcels(data);
      setLoadState('success');
    }).catch((error) => {
      if (ignore) return;
      setErrorMessage(error.message);
      setLoadState('error');
    });
    return () => { ignore = true; };
  }, [status]);

  const summary = useMemo(() => summarizeParcels(parcels), [parcels]);

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow dark">STAFF</p>
          <h1>รายการพัสดุ</h1>
          <p>พัสดุทั้งหมดที่สำนักงานรับไว้</p>
        </div>
        <Link className="button primary inline" to="/staff/parcels/new">+ ลงทะเบียนพัสดุ</Link>
      </div>

      <StatusFilter value={status} onChange={setStatus} />

      {loadState === 'loading' && <p className="state-card" role="status">กำลังโหลดข้อมูล…</p>}
      {loadState === 'error' && <p className="state-card error-state" role="alert">{errorMessage}</p>}
      {loadState === 'success' && (
        <>
          <SummaryPanel summary={summary} />
          {parcels.length === 0 ? (
            <p className="subtle-empty">ไม่มีพัสดุที่ตรงกับตัวกรองนี้</p>
          ) : (
            <div className="parcel-list">
              {parcels.map((p) => (
                <article className="parcel-card" key={p.id}>
                  <div>
                    <p className="parcel-id"><Link to={`/staff/parcels/${p.id}`}>{p.id}</Link> · {p.carrier}</p>
                    <h3>{p.recipientName}</h3>
                    <p>{p.buildingName} · ห้อง {p.room} · มาถึง {p.arrivedAt}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ParcelListPage;
