import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/merchant/login', { email, password });
      const { token, merchant } = res.data.data;
      login(token, { ...merchant, role: 'merchant' });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
            <div style={{ width:'40px', height:'40px', background:'var(--gold)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:'800', color:'#0a0a0f', fontFamily:'var(--font-display)' }}>K</div>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'22px', fontWeight:'700', color:'var(--text)' }}>Kulotisa<span style={{ color:'var(--gold)' }}>Pay</span></span>
          </div>
          <p style={{ color:'var(--text2)', fontSize:'13px' }}>Merchant Portal</p>
        </div>

        {/* Card */}
        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'32px' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:'700', marginBottom:'4px' }}>Welcome back</h2>
          <p style={{ color:'var(--text2)', fontSize:'13px', marginBottom:'28px' }}>Sign in to your merchant account</p>

          {error && (
            <div style={{ background:'var(--red-dim)', border:'1px solid var(--red)', borderRadius:'var(--radius-sm)', padding:'10px 14px', marginBottom:'20px', color:'var(--red)', fontSize:'13px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:'16px' }}>
              <label style={{ display:'block', fontSize:'12px', color:'var(--text2)', marginBottom:'6px', fontWeight:'500' }}>Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@business.co.bw"
                style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:'var(--radius-sm)', padding:'10px 14px', color:'var(--text)', fontSize:'14px', outline:'none', transition:'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor='var(--gold)'}
                onBlur={e => e.target.style.borderColor='var(--border2)'}
              />
            </div>
            <div style={{ marginBottom:'24px' }}>
              <label style={{ display:'block', fontSize:'12px', color:'var(--text2)', marginBottom:'6px', fontWeight:'500' }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:'var(--radius-sm)', padding:'10px 14px', color:'var(--text)', fontSize:'14px', outline:'none', transition:'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor='var(--gold)'}
                onBlur={e => e.target.style.borderColor='var(--border2)'}
              />
            </div>
            <button
              type="submit" disabled={loading}
              style={{ width:'100%', background: loading ? 'var(--border2)' : 'var(--gold)', color: loading ? 'var(--text2)' : '#0a0a0f', border:'none', borderRadius:'var(--radius-sm)', padding:'12px', fontFamily:'var(--font-display)', fontSize:'14px', fontWeight:'700', cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.2s', letterSpacing:'0.3px' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div style={{ marginTop:'20px', padding:'14px', background:'var(--bg3)', borderRadius:'var(--radius-sm)', fontSize:'12px', color:'var(--text2)' }}>
            <strong style={{ color:'var(--text)', display:'block', marginBottom:'4px' }}>Demo credentials</strong>
            kabo@techhub.co.bw / Merchant@1234
          </div>
        </div>

        <p style={{ textAlign:'center', marginTop:'20px', fontSize:'12px', color:'var(--text3)' }}>
          Powered by <span style={{ color:'var(--gold)' }}>AGWANE Capital</span>
        </p>
      </div>
    </div>
  );
}
