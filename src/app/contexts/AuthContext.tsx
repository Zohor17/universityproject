import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export interface DemoUser {
  id: string;
  name: string;
}

interface AuthContextValue {
  user: DemoUser | null;
  loginDemo: () => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const value = useMemo<AuthContextValue>(() => ({
    user,
    loginDemo: () => setUser({ id: "demo-reader", name: "Демо-читатель" }),
    logout: () => setUser(null),
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth должен вызываться внутри AuthProvider.");
  return value;
}
