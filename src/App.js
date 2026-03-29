import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const kpis = [
  { label: 'Revenue at risk', display: '$1.24M', color: '#c0392b', sub: 'billed, not collected' },
  { label: 'Total denied claims', display: '2,318 claims', color: '#c67d14', sub: 'across all payers' },
  { label: 'Est. clean claim rate', display: '72%', color: '#185FA5', sub: 'industry target ≥ 95%' },
  { label: 'Overall denial rate', display: '15.6%', color: '#1a1a1a', sub: 'industry avg ~10%' },
];

const denialCategories = [
  { name: 'Authorization / PA missing', code: 'PI-15', amount: '$458,000', pct: 37, color: '#c0392b', payer: 'Medicaid / Peach State', claims: 857, type: 'Operational', detail: 'auth not obtained or not attached pre-submission' },
  { name: 'Not medically necessary', code: 'CO-50', amount: '$273,000', pct: 22, color: '#e07b39', payer: 'UnitedHealthcare', claims: 509, type: 'Clinical', detail: 'insufficient clinical documentation for level of care' },
  { name: 'Coding error', code: 'PI-16 cluster', amount: '$186,000', pct: 15, color: '#c67d14', payer: 'BCBS of GA', claims: 348, type: 'Operational', detail: 'eligibility / membership issue on rendering NPI' },
  { name: 'Out-of-network / no contract', code: 'PR-242', amount: '$50,000', pct: 4, color: '#534AB7', payer: 'Aetna', claims: 93, type: 'System design', detail: 'claims submitted without active contract' },
  { name: 'Timely filing exceeded', code: 'CO-29', amount: '$186,000', pct: 15, color: '#185FA5', payer: 'Cigna', claims: 348, type: 'Operational', detail: 'claims filed outside payer timely filing window' },
  { name: 'Non-covered benefit', code: 'PR-204', amount: '$50,000', pct: 4, color: '#1D9E75', payer: 'Humana', claims: 93, type: 'Operational', detail: 'plan exclusion not caught at eligibility check' },
  { name: 'Duplicate claim', code: 'CO-18', amount: '$37,000', pct: 3, color: '#888780', payer: 'Multiple', claims: 70, type: 'Operational', detail: 'claim submitted more than once for same date of service' },
];

const payers = [
  { name: 'UnitedHealthcare', rate: 22.3, color: '#c0392b' },
  { name: 'Cigna', rate: 16.2, color: '#e07b39' },
  { name: 'Aetna', rate: 14.7, color: '#c67d14' },
  { name: 'Humana', rate: 13.8, color: '#534AB7' },
  { name: 'Medicaid / Peach State', rate: 12.4, color: '#185FA5' },
  { name: 'BCBS of GA', rate: 10.1, color: '#1D9E75' },
];

const trendData = [
  { month: 'Jan', rate: 17.2, volume: 1120 },
  { month: 'Feb', rate: 16.8, volume: 1080 },
  { month: 'Mar', rate: 15.9, volume: 1210 },
  { month: 'Apr', rate: 16.4, volume: 1190 },
  { month: 'May', rate: 15.1, volume: 1240 },
  { month: 'Jun', rate: 14.7, volume: 1280 },
  { month: 'Jul', rate: 15.3, volume: 1310 },
  { month: 'Aug', rate: 14.9, volume: 1270 },
  { month: 'Sep', rate: 15.6, volume: 1230 },
  { month: 'Oct', rate: 16.1, volume: 1180 },
  { month: 'Nov', rate: 15.8, volume: 1250 },
  { month: 'Dec', rate: 15.6, volume: 1290 },
];

const actionPlan = [
  { focus: 'Prior authorization workflow audit', target: 'Reduce auth denials by 40%', owner: 'UR Team', due: 'Jan 31', status: 'On track' },
  { focus: 'Coding accuracy training (ICD-10/CPT)', target: 'Cut coding errors to <3% of claims', owner: 'Billing Dept.', due: 'Feb 15', status: 'In progress' },
  { focus: 'Payer contract renegotiation — UHC', target: 'Reduce UHC denial rate from 22% to 14%', owner: 'Director of Revenue', due: 'Feb 28', status: 'In progress' },
  { focus: 'Timely filing tracking system', target: 'Zero timely filing denials by Q2', owner: 'Billing Dept.', due: 'Mar 1', status: 'On track' },
  { focus: 'Medical necessity documentation protocol', target: 'Improve clinical doc score to 90%', owner: 'Clinical Director', due: 'Mar 15', status: 'Not started' },
  { focus: 'Appeals workflow optimization', target: 'Increase appeals win rate to 75%', owner: 'AR Team', due: 'Mar 31', status: 'Not started' },
];

const badgeStyle = {
  'On track': { background: '#eaf3de', color: '#3b6d11' },
  'In progress': { background: '#faeeda', color: '#854f0b' },
  'Not started': { background: '#fcebeb', color: '#791f1f' },
};

const navLinks = ['Revenue Health'];
const tabs = ['Overview', 'By payer', 'Denial breakdown', 'Trends', '90-day plan'];

const s = {
  app: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  navbar: { background: '#fff', borderBottom: '1px solid #e5e5e2', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '2rem', height: 52 },
  brand: { fontWeight: 600, fontSize: 14, color: '#1a1a1a', whiteSpace: 'nowrap' },
  navLinks: { display: 'flex', alignItems: 'center', height: '100%' },
  navLink: { padding: '0 1rem', height: '100%', display: 'flex', alignItems: 'center', fontSize: 13, color: '#5f5e5a', cursor: 'pointer', borderBottom: '2px solid transparent' },
  navLinkActive: { padding: '0 1rem', height: '100%', display: 'flex', alignItems: 'center', fontSize: 13, color: '#1a1a1a', cursor: 'pointer', borderBottom: '2px solid #1a1a1a', fontWeight: 500 },
  main: { padding: '2rem', flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%' },
  pageTitle: { fontSize: 24, fontWeight: 600, marginBottom: 4 },
  pageMeta: { fontSize: 12, color: '#888780', marginBottom: '1.5rem' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '1.5rem' },
  kpiCard: { background: '#fff', border: '1px solid #e5e5e2', borderRadius: 8, padding: '1rem 1.25rem' },
  kpiLabel: { fontSize: 12, color: '#888780', marginBottom: 6 },
  kpiSub: { fontSize: 11, color: '#888780', marginTop: 4 },
  tabNav: { display: 'flex', borderBottom: '1px solid #e5e5e2', marginBottom: '1.5rem' },
  tabBtn: { padding: '8px 1rem', fontSize: 13, color: '#888780', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer' },
  tabBtnActive: { padding: '8px 1rem', fontSize: 13, color: '#1a1a1a', background: 'none', border: 'none', borderBottom: '2px solid #1a1a1a', cursor: 'pointer', fontWeight: 500 },
  sectionTitle: { fontSize: 15, fontWeight: 600, marginBottom: '1rem' },
  card: { background: '#fff', border: '1px solid #e5e5e2', borderRadius: 8, padding: '1.25rem', marginBottom: '1.25rem' },
  cardTitle: { fontSize: 13, fontWeight: 500, marginBottom: '1rem', color: '#5f5e5a' },
  denialRow: { padding: '14px 0', borderBottom: '1px solid #f0efea' },
  denialRowTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  denialName: { fontSize: 13, fontWeight: 500 },
  denialCode: { fontSize: 12, color: '#888780', marginLeft: 6 },
  denialAmount: { fontSize: 13, fontWeight: 500, color: '#5f5e5a', whiteSpace: 'nowrap', marginLeft: '1rem' },
  barTrack: { height: 5, background: '#f0efea', borderRadius: 99, marginBottom: 6, overflow: 'hidden' },
  denialMeta: { fontSize: 11, color: '#888780' },
  payerRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 },
  payerName: { fontSize: 12, width: 160, flexShrink: 0, color: '#5f5e5a' },
  payerTrack: { flex: 1, height: 8, background: '#f0efea', borderRadius: 99, overflow: 'hidden' },
  payerPct: { fontSize: 12, fontWeight: 500, width: 36, textAlign: 'right', color: '#1a1a1a' },
  planTable: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', fontSize: 11, fontWeight: 500, color: '#888780', padding: '8px 12px', borderBottom: '1px solid #e5e5e2', textTransform: 'uppercase', letterSpacing: '0.04em' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f0efea', verticalAlign: 'middle' },
  badge: { display: 'inline-block', fontSize: 11, padding: '3px 9px', borderRadius: 99, fontWeight: 500 },
};

export default function App() {
  const [navActive, setNavActive] = useState('Revenue Health');
  const [tab, setTab] = useState('Overview');
  const maxRate = Math.max(...payers.map(p => p.rate));

  return (
    <div style={s.app}>
      <nav style={s.navbar}>
        <span style={s.brand}>Peach State Behavioral Health</span>
        <div style={s.navLinks}>
          {navLinks.map(l => (
            <span key={l} style={navActive === l ? s.navLinkActive : s.navLink} onClick={() => setNavActive(l)}>{l}</span>
          ))}
        </div>
      </nav>

      <main style={s.main}>
        <h1 style={s.pageTitle}>Revenue Health Dashboard</h1>
        <p style={s.pageMeta}>Peach State Behavioral Health · FY 2024 · Savannah, GA</p>

        <div style={s.kpiGrid}>
          {kpis.map(k => (
            <div key={k.label} style={s.kpiCard}>
              <div style={s.kpiLabel}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: k.color }}>{k.display}</div>
              <div style={s.kpiSub}>{k.sub}</div>
            </div>
          ))}
        </div>

        <div style={s.tabNav}>
          {tabs.map(t => (
            <button key={t} style={tab === t ? s.tabBtnActive : s.tabBtn} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {tab === 'Overview' && (
          <div>
            <div style={s.sectionTitle}>Revenue at risk by denial category</div>
            {denialCategories.map(d => (
              <div key={d.code} style={s.denialRow}>
                <div style={s.denialRowTop}>
                  <span>
                    <span style={s.denialName}>{d.name}</span>
                    <span style={s.denialCode}>({d.code})</span>
                  </span>
                  <span style={s.denialAmount}>{d.amount} · {d.pct}%</span>
                </div>
                <div style={s.barTrack}>
                  <div style={{ height: '100%', borderRadius: 99, width: `${d.pct}%`, background: d.color }} />
                </div>
                <div style={s.denialMeta}>{d.payer} · {d.claims} claims · {d.type} — {d.detail}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'By payer' && (
          <div style={s.card}>
            <div style={s.cardTitle}>Denial rate by payer — FY 2024</div>
            {payers.map(p => (
              <div key={p.name} style={s.payerRow}>
                <div style={s.payerName}>{p.name}</div>
                <div style={s.payerTrack}>
                  <div style={{ height: '100%', borderRadius: 99, width: `${(p.rate / maxRate) * 100}%`, background: p.color }} />
                </div>
                <div style={s.payerPct}>{p.rate.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'Denial breakdown' && (
          <div style={s.card}>
            <div style={s.cardTitle}>Denial reasons breakdown — % of total denied claims</div>
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie data={denialCategories} cx="50%" cy="50%" innerRadius={80} outerRadius={130} paddingAngle={2} dataKey="pct">
                  {denialCategories.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend formatter={(v) => <span style={{ fontSize: 12, color: '#5f5e5a' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {tab === 'Trends' && (
          <div style={s.card}>
            <div style={s.cardTitle}>Monthly denial rate & claim volume — 2024</div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0efea" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" domain={[12, 20]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[900, 1400]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, name) => name === 'Denial rate' ? `${v}%` : v.toLocaleString()} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="rate" name="Denial rate" stroke="#1D9E75" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="volume" name="Claims volume" stroke="#378ADD" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {tab === '90-day plan' && (
          <div style={s.card}>
            <div style={s.cardTitle}>90-day denial reduction action plan — Q1 2025</div>
            <table style={s.planTable}>
              <thead>
                <tr>
                  <th style={s.th}>Focus area</th>
                  <th style={s.th}>Target metric</th>
                  <th style={s.th}>Owner</th>
                  <th style={s.th}>Due</th>
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {actionPlan.map((row, i) => (
                  <tr key={i}>
                    <td style={s.td}>{row.focus}</td>
                    <td style={{ ...s.td, color: '#5f5e5a' }}>{row.target}</td>
                    <td style={{ ...s.td, color: '#5f5e5a' }}>{row.owner}</td>
                    <td style={{ ...s.td, color: '#5f5e5a', whiteSpace: 'nowrap' }}>{row.due}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, ...badgeStyle[row.status] }}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
