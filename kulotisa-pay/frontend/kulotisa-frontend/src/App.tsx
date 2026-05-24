import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Payouts from './pages/Payouts';
import Plans from './pages/Plans';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth();
  if (isLoading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#f0b429', fontFamily:'Syne,sans-serif', fontSize:'18px' }}>◎ KulotisaPay</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
      <Route path="/dashboard/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/dashboard/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/dashboard/payouts" element={<ProtectedRoute><Payouts /></ProtectedRoute>} />
      <Route path="/dashboard/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
