import React, { createContext, useContext, useState, useEffect } from 'react';
interface AuthUser { id: string; business_name: string; status: string; role: string; }
interface AuthContextType { user: AuthUser|null; token: string|null; login:(t:string,u:AuthUser)=>void; logout:()=>void; isLoading:boolean; }
const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<AuthUser|null>(null);
  const [token, setToken] = useState<string|null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = localStorage.getItem('kp_token');
    const u = localStorage.getItem('kp_user');
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    setIsLoading(false);
  }, []);
  const login = (t: string, u: AuthUser) => {
    localStorage.setItem('kp_token', t); localStorage.setItem('kp_user', JSON.stringify(u));
    setToken(t); setUser(u);
  };
  const logout = () => { localStorage.clear(); setToken(null); setUser(null); };
  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
