import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { path:'/dashboard', label:'Overview', icon:'▦' },
  { path:'/dashboard/orders', label:'Orders', icon:'◈' },
  { path:'/dashboard/customers', label:'Customers', icon:'◉' },
  { path:'/dashboard/payouts', label:'Payouts', icon:'◎' },
  { path:'/dashboard/plans', label:'Plans', icon:'◇' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: collapsed?'60px':'220px', background:'var(--bg2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', transition:'width 0.25s ease', flexShrink:0, position:'sticky', top:0, height:'100vh' }}>
        {/* Logo */}
        <div style={{ padding: collapsed?'20px 0':'20px 20px', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid var(--border)', justifyContent: collapsed?'center':'flex-start', height:'60px' }}>
          <div style={{ width:'28px', height:'28px', background:'var(--gold)', borderRadius:'7px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'800', color:'#0a0a0f', fontFamily:'var(--font-display)', flexShrink:0 }}>K</div>
          {!collapsed && <span style={{ fontFamily:'var(--font-display)', fontSize:'16px', fontWeight:'700' }}>Kulotisa<span style={{ color:'var(--gold)' }}>Pay</span></span>}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 8px' }}>
          {NAV.map(item => {
            const active = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px', padding: collapsed?'10px 0':'10px 12px', justifyContent: collapsed?'center':'flex-start', background: active?'var(--gold-dim)':'transparent', border: active?'1px solid rgba(240,180,41,0.2)':'1px solid transparent', borderRadius:'var(--radius-sm)', color: active?'var(--gold)':'var(--text2)', cursor:'pointer', marginBottom:'2px', transition:'all 0.15s', fontSize:'13px', fontWeight: active?'500':'400' }}
                onMouseEnter={e => { if(!active) { (e.currentTarget as HTMLElement).style.background='var(--bg3)'; (e.currentTarget as HTMLElement).style.color='var(--text)'; }}}
                onMouseLeave={e => { if(!active) { (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color='var(--text2)'; }}}
              >
                <span style={{ fontSize:'16px', flexShrink:0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Merchant info + logout */}
        <div style={{ padding:'12px 8px', borderTop:'1px solid var(--border)' }}>
          {!collapsed && (
            <div style={{ padding:'10px 12px', marginBottom:'8px', background:'var(--bg3)', borderRadius:'var(--radius-sm)' }}>
              <div style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'2px' }}>Logged in as</div>
              <div style={{ fontSize:'12px', color:'var(--text)', fontWeight:'500', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.business_name || 'Merchant'}</div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'4px', marginTop:'4px', fontSize:'10px', color:'var(--green)', background:'var(--green-dim)', padding:'2px 6px', borderRadius:'20px' }}>
                <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'var(--green)', display:'inline-block' }}></span>
                {user?.status || 'active'}
              </div>
            </div>
          )}
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ width:'100%', padding: collapsed?'10px 0':'10px 12px', display:'flex', alignItems:'center', gap:'10px', justifyContent: collapsed?'center':'flex-start', background:'transparent', border:'1px solid transparent', borderRadius:'var(--radius-sm)', color:'var(--text3)', cursor:'pointer', fontSize:'13px', transition:'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='var(--red)'; (e.currentTarget as HTMLElement).style.background='var(--red-dim)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='var(--text3)'; (e.currentTarget as HTMLElement).style.background='transparent'; }}
          >
            <span style={{ fontSize:'16px' }}>⎋</span>
            {!collapsed && 'Sign out'}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          style={{ position:'absolute', top:'50%', right:'-12px', width:'24px', height:'24px', borderRadius:'50%', background:'var(--bg3)', border:'1px solid var(--border2)', cursor:'pointer', color:'var(--text2)', fontSize:'11px', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
          {collapsed ? '›' : '‹'}
        </button>
      </aside>

      {/* Main */}
      <main style={{ flex:1, overflow:'auto', padding:'0' }}>
        {/* Top bar */}
        <div style={{ height:'60px', background:'var(--bg2)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', position:'sticky', top:0, zIndex:5 }}>
          <div style={{ fontSize:'13px', color:'var(--text2)' }}>
            {new Date().toLocaleDateString('en-BW', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--green)', animation:'pulse-gold 2s infinite' }}></div>
            <span style={{ fontSize:'12px', color:'var(--green)' }}>API Live</span>
          </div>
        </div>
        <div style={{ padding:'28px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
