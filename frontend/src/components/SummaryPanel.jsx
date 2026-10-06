const items = [
  ['total', 'ทั้งหมด'],
  ['arrived', 'มาถึงแล้ว'],
  ['notified', 'แจ้งผู้รับแล้ว'],
  ['pickedUp', 'รับแล้ว'],
  ['returned', 'ส่งคืนผู้ส่ง'],
];

function SummaryPanel({ summary }) {
  return (
    <section className="summary-grid" aria-label="สรุปรายการที่แสดง">
      {items.map(([key, label]) => (
        <article className="summary-card" key={key}>
          <span>{label}</span>
          <strong>{summary[key]}</strong>
        </article>
      ))}
    </section>
  );
}

export default SummaryPanel;
