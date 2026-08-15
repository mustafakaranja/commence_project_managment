"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type Role, type Permission, hasPermission } from "@/lib/permissions";

export interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  role: Role;
  designation?: string;
  username: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  can: (permission: Permission) => boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  can: () => false,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user ?? null);
    setLoading(false);
  };

  useEffect(() => {
    let ignore = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!ignore) { setUser(data.user ?? null); setLoading(false); }
      });
    return () => { ignore = true; };
  }, []);

  const can = (permission: Permission) => {
    if (!user) return false;
    return hasPermission(user.role, permission, user.designation);
  };

  return (
    <AuthContext.Provider value={{ user, loading, can, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
