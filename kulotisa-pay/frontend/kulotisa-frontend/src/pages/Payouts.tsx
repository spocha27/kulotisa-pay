import React from 'react';
const payouts = [
  { id:1, period:'May 2025 — Batch 2', count:23, amount:12840, status:'processing', date:'Fri 23 May' },
  { id:2, period:'May 2025 — Batch 1', count:18, amount:9620, status:'transferred', date:'09 May' },
  { id:3, period:'April 2025 — Batch 2', count:31, amount:16340, status:'transferred', date:'25 Apr' },
  { id:4, period:'April 2025 — Batch 1', count:14, amount:8100, status:'transferred', date:'11 Apr' },
  { id:5, period:'March 2025', count:27, amount:14580, status:'transferred', date:'28 Mar' },
];
export default function Payouts() {
  return (
    <div style={{ animation:'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'22px', fontWeight:'700', marginBottom:'4px' }}>Payouts</h1>
        <p style={{ color:'var(--text2)', fontSize:'13px' }}>Settlement history from KulotisaPay</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'20px' }}>
        {[{ label:'Total Paid Out', value:'P 61,480', sub:'Since activation' },{ label:'Processing', value:'P 12,840', sub:'Due Fri 23 May', accent:'var(--gold)' },{ label:'Merchant Fee Rate', value:'3.0%', sub:'Per transaction' }].map(m => (
          <div key={m.label} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'16px' }}>
            <div style={{ fontSize:'11px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>{m.label}</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'22px', fontWeight:'700', color:m.accent||'var(--text)' }}>{m.value}</div>
            <div style={{ fontSize:'12px', color:'var(--text3)', marginTop:'4px' }}>{m.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'20px' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:'600', marginBottom:'16px' }}>Payout History</div>
        {payouts.map(p => (
          <div key={p.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>{p.period}</div>
              <div style={{ fontSize:'12px', color:'var(--text3)' }}>{p.count} instalments collected</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'15px', fontWeight:'700', marginBottom:'4px' }}>P {p.amount.toLocaleString()}</div>
              <span style={{ background: p.status==='processing'?'var(--gold-dim)':'var(--green-dim)', color: p.status==='processing'?'var(--gold)':'var(--green)', padding:'2px 8px', borderRadius:'20px', fontSize:'11px' }}>{p.status==='processing'?'Processing':'Transferred'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
