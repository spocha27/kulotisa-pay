import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const filters = ['All','Active','Completed','Overdue','Pending'];
const StatusBadge = ({ status }: { status: string }) => {
  const map: any = { active:{bg:'var(--green-dim)',color:'var(--green)',label:'Active'}, completed:{bg:'var(--blue-dim)',color:'var(--blue)',label:'Completed'}, defaulted:{bg:'var(--red-dim)',color:'var(--red)',label:'Overdue'}, pending:{bg:'var(--gold-dim)',color:'var(--gold)',label:'Pending'}, cancelled:{bg:'var(--border)',color:'var(--text3)',label:'Cancelled'} };
  const s = map[status]||map.pending;
  return <span style={{ background:s.bg, color:s.color, padding:'3px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:'500' }}>{s.label}</span>;
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/merchants/${user.id}/dashboard`).then(r => setOrders(r.data.data.recent_transactions||[])).catch(()=>setOrders([])).finally(()=>setLoading(false));
  }, [user]);

  const filtered = orders.filter(o => {
    const matchFilter = filter==='All'||o.status===filter.toLowerCase();
    const matchSearch = !search || o.full_name?.toLowerCase().includes(search.toLowerCase()) || o.reference?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ animation:'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'22px', fontWeight:'700', marginBottom:'4px' }}>Orders</h1>
        <p style={{ color:'var(--text2)', fontSize:'13px' }}>All BNPL transactions at your store</p>
      </div>

      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'20px' }}>
        <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'5px 14px', borderRadius:'20px', border:'1px solid', borderColor: filter===f?'var(--gold)':'var(--border2)', background: filter===f?'var(--gold-dim)':'transparent', color: filter===f?'var(--gold)':'var(--text2)', cursor:'pointer', fontSize:'12px', fontWeight: filter===f?'500':'400', transition:'all 0.15s' }}>
              {f}
            </button>
          ))}
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search customer or ref..."
            style={{ marginLeft:'auto', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:'var(--radius-sm)', padding:'6px 12px', color:'var(--text)', fontSize:'13px', outline:'none', width:'200px' }}
            onFocus={e=>e.target.style.borderColor='var(--gold)'}
            onBlur={e=>e.target.style.borderColor='var(--border2)'}
          />
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'40px', color:'var(--text3)' }}>Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'var(--text3)', fontSize:'13px' }}>
            No orders found.<br/><span style={{ color:'var(--text2)' }}>Seed data contains 3 demo transactions.</span>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Reference','Customer','Amount','Plan','Status','Date'].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'0 0 10px', fontSize:'11px', color:'var(--text3)', fontWeight:'500', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx: any) => (
                <tr key={tx.id} style={{ borderBottom:'1px solid var(--border)' }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg3)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                  <td style={{ padding:'12px 0', fontSize:'12px', color:'var(--gold)', fontFamily:'var(--font-display)' }}>{tx.reference||'KLP-2025-00001'}</td>
                  <td style={{ padding:'12px 0', fontSize:'13px' }}>{tx.full_name}</td>
                  <td style={{ padding:'12px 0', fontSize:'13px', fontWeight:'500' }}>P {parseFloat(tx.amount).toLocaleString()}</td>
                  <td style={{ padding:'12px 0', fontSize:'12px', color:'var(--text2)' }}>{tx.num_instalments}× monthly</td>
                  <td style={{ padding:'12px 0' }}><StatusBadge status={tx.status} /></td>
                  <td style={{ padding:'12px 0', fontSize:'12px', color:'var(--text3)' }}>{new Date(tx.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
