import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createParcel, getBuildings } from '../services/parcelService.js';

const CARRIERS = ['ไปรษณีย์ไทย', 'Kerry', 'Flash', 'J&T', 'อื่น ๆ'];
const emptyForm = { recipientName: '', buildingId: '', room: '', carrier: '', trackingNo: '', note: '' };

function NewParcelPage() {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getBuildings().then(setBuildings).catch((error) => setErrors([error.message]));
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrors([]);
    try {
      // ตรวจข้อมูลที่ API (ฝั่งเบราว์เซอร์แก้ได้เสมอ) · API ตอบ 400 พร้อม errors ถ้าไม่ผ่าน
      const created = await createParcel({ ...form, buildingId: Number(form.buildingId) || null });
      navigate(`/staff/parcels/${created.id}`);
    } catch (error) {
      setErrors(error.errors?.length ? error.errors : [error.message]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow dark">STAFF</p>
          <h1>ลงทะเบียนพัสดุ</h1>
          <p>พัสดุใหม่เริ่มที่สถานะ "มาถึงแล้ว"</p>
        </div>
      </div>
      <form className="panel form-panel" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="recipientName">ชื่อผู้รับ</label>
          <input id="recipientName" name="recipientName" value={form.recipientName} onChange={handleChange} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="buildingId">อาคาร</label>
            <select id="buildingId" name="buildingId" value={form.buildingId} onChange={handleChange}>
              <option value="">-- เลือกอาคาร --</option>
              {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="room">เลขห้อง</label>
            <input id="room" name="room" placeholder="A-305" value={form.room} onChange={handleChange} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="carrier">บริษัทขนส่ง</label>
            <select id="carrier" name="carrier" value={form.carrier} onChange={handleChange}>
              <option value="">-- เลือกบริษัท --</option>
              {CARRIERS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="trackingNo">เลขพัสดุ</label>
            <input id="trackingNo" name="trackingNo" value={form.trackingNo} onChange={handleChange} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="note">หมายเหตุ (ไม่บังคับ)</label>
          <textarea id="note" name="note" rows="3" value={form.note} onChange={handleChange} />
        </div>
        {errors.length > 0 && (
          <ul className="field-error" role="alert">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        )}
        <button className="button primary" type="submit" disabled={submitting}>
          {submitting ? 'กำลังบันทึก…' : 'บันทึกพัสดุ'}
        </button>
      </form>
    </section>
  );
}

export default NewParcelPage;
