import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/merchants/${user.id}/dashboard`).then(r => {
      const txs = r.data.data.recent_transactions||[];
      const map = new Map();
      txs.forEach((tx: any) => {
        if (!map.has(tx.user_id)) map.set(tx.user_id, { ...tx, orders:1, total:parseFloat(tx.amount) });
        else { const c=map.get(tx.user_id); c.orders++; c.total+=parseFloat(tx.amount); }
      });
      setCustomers(Array.from(map.values()));
    }).catch(()=>setCustomers([])).finally(()=>setLoading(false));
  }, [user]);

  const initials = (name: string) => name?.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2)||'??';
  const colors = ['#f0b429','#06d6a0','#118ab2','#ef476f','#8338ec'];

  return (
    <div style={{ animation:'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'22px', fontWeight:'700', marginBottom:'4px' }}>Customers</h1>
        <p style={{ color:'var(--text2)', fontSize:'13px' }}>Users who have transacted at your store</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'20px' }}>
        {[{ label:'Total Customers', value:customers.length||'0' }, { label:'Repeat Buyers', value: customers.filter(c=>c.orders>1).length||'0' }, { label:'Avg Order Value', value: customers.length?`P ${Math.round(customers.reduce((a,c)=>a+c.total,0)/customers.length).toLocaleString()}`:'—' }].map(m => (
          <div key={m.label} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'16px' }}>
            <div style={{ fontSize:'11px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>{m.label}</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'22px', fontWeight:'700' }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'20px' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:'600', marginBottom:'16px' }}>Customer List</div>
        {loading ? <div style={{ textAlign:'center', padding:'40px', color:'var(--text3)' }}>Loading...</div> :
          customers.length===0 ? <div style={{ textAlign:'center', padding:'40px', color:'var(--text3)', fontSize:'13px' }}>No customers yet</div> :
          customers.map((c, i) => (
            <div key={c.user_id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:`${colors[i%colors.length]}22`, border:`1px solid ${colors[i%colors.length]}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'600', color:colors[i%colors.length], flexShrink:0 }}>{initials(c.full_name)}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'13px', fontWeight:'500' }}>{c.full_name}</div>
                <div style={{ fontSize:'12px', color:'var(--text3)' }}>{c.orders} order{c.orders!==1?'s':''} · {c.phone}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:'13px', fontWeight:'500' }}>P {c.total.toLocaleString()}</div>
                <div style={{ fontSize:'11px', color:'var(--text3)' }}>lifetime</div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
