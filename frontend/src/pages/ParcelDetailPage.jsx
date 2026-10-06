import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge.jsx';
import { deleteParcel, getParcel, updateParcelStatus } from '../services/parcelService.js';
import { STATUS_LABELS } from '../utils/parcelSummary.js';

function ParcelDetailPage() {
  const { parcelId } = useParams();
  const navigate = useNavigate();
  const [parcel, setParcel] = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoadState('loading');
    getParcel(parcelId).then((result) => {
      if (ignore) return;
      setParcel(result);
      setLoadState('success');
    }).catch((error) => {
      if (ignore) return;
      setNotice(error.message);
      setLoadState('error');
    });
    return () => { ignore = true; };
  }, [parcelId]);

  async function handleStatusChange(event) {
    const next = event.target.value;
    setSaving(true);
    setNotice('');
    try {
      setParcel(await updateParcelStatus(parcelId, next));
      setNotice(`เปลี่ยนสถานะเป็น "${STATUS_LABELS[next]}" แล้ว`);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`ลบพัสดุ ${parcelId} ออกจากระบบ?`)) return;
    try {
      await deleteParcel(parcelId);
      navigate('/staff/parcels');
    } catch (error) {
      setNotice(error.message);
    }
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow dark">STAFF</p>
          <h1>รายละเอียดพัสดุ</h1>
          <p>รหัส <code>{parcelId}</code></p>
        </div>
      </div>
      {loadState === 'loading' && <p className="state-card" role="status">กำลังโหลดรายละเอียด…</p>}
      {loadState === 'error' && <p className="state-card error-state" role="alert">{notice}</p>}
      {loadState === 'success' && !parcel && (
        <section className="state-card"><h2>ไม่พบพัสดุ</h2><Link to="/staff/parcels">กลับรายการพัสดุ</Link></section>
      )}
      {loadState === 'success' && parcel && (
        <article className="panel detail-card">
          <h2>{parcel.recipientName} <StatusBadge status={parcel.status} /></h2>
          <dl>
            <div><dt>อาคาร / ห้อง</dt><dd>{parcel.buildingName} · {parcel.room}</dd></div>
            <div><dt>บริษัทขนส่ง</dt><dd>{parcel.carrier}</dd></div>
            <div><dt>เลขพัสดุ</dt><dd><code>{parcel.trackingNo}</code></dd></div>
            <div><dt>วันที่มาถึง</dt><dd>{parcel.arrivedAt}</dd></div>
            <div><dt>หมายเหตุ</dt><dd>{parcel.note ?? '—'}</dd></div>
            <div>
              <dt><label htmlFor="status">สถานะ</label></dt>
              <dd>
                <select id="status" value={parcel.status} onChange={handleStatusChange} disabled={saving}>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </dd>
            </div>
          </dl>
          {notice && <p className="notice" role="status">{notice}</p>}
          <div className="actions">
            <Link to="/staff/parcels">กลับรายการพัสดุ</Link>
            <button className="button danger" type="button" onClick={handleDelete}>ลบพัสดุ</button>
          </div>
        </article>
      )}
    </section>
  );
}

export default ParcelDetailPage;
