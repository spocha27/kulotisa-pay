import React, { useState } from 'react';
const defaultPlans = [
  { id:1, name:'Split in 3', instalments:3, interval:'monthly', interest:0 },
  { id:2, name:'Split in 4', instalments:4, interval:'monthly', interest:0 },
  { id:3, name:'Split in 6 — Extended', instalments:6, interval:'monthly', interest:0 },
];
export default function Plans() {
  const [plans] = useState(defaultPlans);
  return (
    <div style={{ animation:'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'22px', fontWeight:'700', marginBottom:'4px' }}>Installment Plans</h1>
        <p style={{ color:'var(--text2)', fontSize:'13px' }}>Configure how customers split payments at your store</p>
      </div>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'20px', marginBottom:'16px' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:'600', marginBottom:'16px' }}>Active Plans</div>
        {plans.map(p => (
          <div key={p.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:'var(--radius-sm)', padding:'14px 16px', marginBottom:'8px' }}>
            <div>
              <div style={{ fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>{p.name}</div>
              <div style={{ fontSize:'12px', color:'var(--text3)' }}>{p.instalments} equal payments · {p.interval} · {p.interest===0?'0% interest':'Interest applies'}</div>
            </div>
            <button style={{ background:'transparent', border:'1px solid var(--border2)', borderRadius:'var(--radius-sm)', padding:'5px 12px', color:'var(--gold)', cursor:'pointer', fontSize:'12px' }}>Edit</button>
          </div>
        ))}
        <button style={{ display:'flex', alignItems:'center', gap:'6px', background:'transparent', border:'none', color:'var(--gold)', cursor:'pointer', fontSize:'13px', padding:'8px 0', marginTop:'4px' }}>
          <span style={{ fontSize:'18px' }}>+</span> Add new plan
        </button>
      </div>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'20px' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:'600', marginBottom:'16px' }}>Plan Rules</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'12px' }}>
          {[{ label:'Min order value', value:'P 300' },{ label:'Max order value', value:'P 15,000' },{ label:'Late fee', value:'P 50', sub:'Per missed instalment' },{ label:'Grace period', value:'3 days', sub:'Before fee applies' }].map(r => (
            <div key={r.label} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'14px' }}>
              <div style={{ fontSize:'11px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>{r.label}</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:'700' }}>{r.value}</div>
              {r.sub && <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'2px' }}>{r.sub}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
