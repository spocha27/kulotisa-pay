import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Metric = ({ label, value, sub, accent }: any) => (
  <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'20px', transition:'border-color 0.2s' }}
    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor='var(--border2)'}
    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor='var(--border)'}>
    <div style={{ fontSize:'11px', color:'var(--text3)', fontWeight:'500', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'8px' }}>{label}</div>
    <div style={{ fontSize:'26px', fontFamily:'var(--font-display)', fontWeight:'700', color: accent||'var(--text)', letterSpacing:'-0.5px', marginBottom:'4px' }}>{value}</div>
    {sub && <div style={{ fontSize:'12px', color:'var(--text3)' }}>{sub}</div>}
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: any = {
    active: { bg:'var(--green-dim)', color:'var(--green)', label:'On track' },
    completed: { bg:'var(--blue-dim)', color:'var(--blue)', label:'Completed' },
    late: { bg:'var(--red-dim)', color:'var(--red)', label:'Overdue' },
    pending: { bg:'var(--gold-dim)', color:'var(--gold)', label:'Pending' },
  };
  const s = map[status] || map.pending;
  return <span style={{ background:s.bg, color:s.color, padding:'3px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:'500' }}>{s.label}</span>;
};

const mockGMV = [
  {month:'Dec',gmv:41000},{month:'Jan',gmv:37000},{month:'Feb',gmv:52000},
  {month:'Mar',gmv:61000},{month:'Apr',gmv:71000},{month:'May',gmv:84320},
];

export default function Overview() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/merchants/${user.id}/dashboard`)
      .then(r => setData(r.data.data))
      .catch(() => setData({ overview:{ total_gmv:'84320', active_orders:'47', total_fees:'2529' }, recent_transactions:[] }))
      .finally(() => setLoading(false));
  }, [user]);

  const fmt = (n: any) => `P ${parseFloat(n||0).toLocaleString('en-BW', { minimumFractionDigits:0 })}`;

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'300px', color:'var(--text3)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'28px', marginBottom:'12px' }}>◎</div>
        <div style={{ fontSize:'13px' }}>Loading dashboard...</div>
      </div>
    </div>
  );

  const txs = data?.recent_transactions || [];

  return (
    <div style={{ animation:'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'24px', fontWeight:'700', marginBottom:'4px' }}>
          Good {new Date().getHours()<12?'morning':'afternoon'}, {user?.business_name?.split(' ')[0]} ◈
        </h1>
        <p style={{ color:'var(--text2)', fontSize:'13px' }}>Here's your BNPL performance overview</p>
      </div>

      {/* Metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'24px' }}>
        <Metric label="Total GMV" value={fmt(data?.overview?.total_gmv)} sub="All time" accent="var(--gold)" />
        <Metric label="Active Orders" value={data?.overview?.active_orders||'0'} sub="In progress" />
        <Metric label="Fees Earned" value={fmt(data?.overview?.total_fees)} sub="3% rate" accent="var(--green)" />
        <Metric label="Next Payout" value="P 12,840" sub="Processing · Fri" accent="var(--blue)" />
      </div>

      {/* Chart + health */}
      <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:'14px', marginBottom:'24px' }}>
        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:'600', marginBottom:'2px' }}>Monthly GMV</div>
              <div style={{ fontSize:'12px', color:'var(--text3)' }}>Last 6 months · BWP</div>
            </div>
            <div style={{ fontSize:'22px', fontFamily:'var(--font-display)', fontWeight:'700', color:'var(--gold)' }}>↑18%</div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={mockGMV}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f0b429" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f0b429" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill:'#4a4a6a', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:'8px', fontSize:'12px' }} formatter={(v:any) => [`P ${v.toLocaleString()}`, 'GMV']} />
              <Area type="monotone" dataKey="gmv" stroke="#f0b429" strokeWidth={2} fill="url(#goldGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'20px' }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:'600', marginBottom:'4px' }}>Repayment Health</div>
          <div style={{ fontSize:'12px', color:'var(--text3)', marginBottom:'20px' }}>Current portfolio</div>
          {[
            { label:'On track', pct:78, color:'var(--green)' },
            { label:'Completed', pct:13, color:'var(--blue)' },
            { label:'Overdue', pct:9, color:'var(--red)' },
          ].map(b => (
            <div key={b.label} style={{ marginBottom:'14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'6px' }}>
                <span style={{ color:'var(--text2)' }}>{b.label}</span>
                <span style={{ color:'var(--text)', fontWeight:'500' }}>{b.pct}%</span>
              </div>
              <div style={{ height:'5px', background:'var(--bg3)', borderRadius:'3px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${b.pct}%`, background:b.color, borderRadius:'3px', transition:'width 1s ease' }}></div>
              </div>
            </div>
          ))}
          <div style={{ marginTop:'20px', padding:'12px', background:'var(--bg3)', borderRadius:'var(--radius-sm)' }}>
            <div style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Recent</div>
            <div style={{ fontSize:'12px', color:'var(--text2)', lineHeight:'1.9' }}>
              <div><span style={{ color:'var(--green)' }}>●</span> Instalment paid · P 800 <span style={{ color:'var(--text3)' }}>2h ago</span></div>
              <div><span style={{ color:'var(--red)' }}>●</span> Missed payment · P 450 <span style={{ color:'var(--text3)' }}>1d ago</span></div>
              <div><span style={{ color:'var(--green)' }}>●</span> New order · P 3,200 <span style={{ color:'var(--text3)' }}>1d ago</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:'600' }}>Recent Orders</div>
        </div>
        {txs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'32px', color:'var(--text3)', fontSize:'13px' }}>
            No transactions yet — seed data is loaded in the DB.<br/>
            <span style={{ color:'var(--text2)' }}>Log in with a seeded merchant to see data.</span>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Customer','Amount','Instalments','Status','Date'].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'0 0 10px', fontSize:'11px', color:'var(--text3)', fontWeight:'500', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txs.slice(0,8).map((tx: any) => (
                <tr key={tx.id} style={{ borderBottom:'1px solid var(--border)' }}>
                  <td style={{ padding:'12px 0', fontSize:'13px' }}>{tx.full_name}</td>
                  <td style={{ padding:'12px 0', fontSize:'13px', fontWeight:'500' }}>P {parseFloat(tx.amount).toLocaleString()}</td>
                  <td style={{ padding:'12px 0', fontSize:'12px', color:'var(--text2)' }}>{tx.num_instalments}×</td>
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
