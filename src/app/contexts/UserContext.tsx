import React, { createContext, useContext, useEffect, useState } from 'react';

type User = {
  id?: string;
  _id?: string;
  username?: string;
  email?: string;
  avatar?: string;
  balance?: number;
  // thêm các field khác nếu backend trả về
};

type Ctx = {
  user: User | null;
  balance: number;
  setUser: (u: User | null) => void;
  setBalance: (n: number) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const UserContext = createContext<Ctx | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });
  const [balance, setBalance] = useState<number>(user?.balance || 0);

  async function refreshUser() {
    try {
      const apiMod = await import('../api');
      let me: any = null;

      // Ưu tiên gọi auth.me để lấy full user info
      if (apiMod.api.auth?.me) {
        me = await apiMod.api.auth.me();
      } else if (apiMod.api.tx?.me) {
        me = await apiMod.api.tx.me();
      }

      if (me) {
        // backend có thể trả về { user, balance } hoặc trả thẳng user object
        const newUser = me.user || me;
        setUser(newUser);
        setBalance(newUser.balance || 0);
        localStorage.setItem('user', JSON.stringify(newUser));
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshUser(); // gọi ngay lần đầu
      const t = setInterval(refreshUser, 5000); // poll mỗi 5s
      return () => clearInterval(t);
    }
  }, []);

  function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setBalance(0);
  }

  return (
    <UserContext.Provider value={{ user, balance, setUser, setBalance, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
