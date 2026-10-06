/**
 * parcelSummary.js — ป้ายสถานะ และการนับพัสดุตามสถานะ (pure function · ทดสอบได้)
 *
 * ⚠ ค่าสถานะต้องตรงกับที่ API ส่งมาทุกตัวอักษร: 'arrived' · 'notified' · 'picked-up' · 'returned'
 */
export const STATUS_LABELS = {
  arrived: 'มาถึงแล้ว',
  notified: 'แจ้งผู้รับแล้ว',
  'picked-up': 'รับแล้ว',
  returned: 'ส่งคืนผู้ส่ง',
};

export function summarizeParcels(parcels) {
  const count = (status) => parcels.filter((p) => p.status === status).length;
  const arrived = count('arrived');
  const notified = count('notified');
  return {
    total: parcels.length,
    arrived,
    notified,
    pickedUp: count('picked-up'),
    returned: count('returned'),
    waiting: arrived + notified,    // ยังรอผู้รับมารับที่สำนักงาน
  };
}
