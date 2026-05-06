import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, setAccessToken, setUnauthorizedHandler } from "../api/client";

export type AuthEmployee = {
  id: number;
  login: string;
  fname: string;
  email: string | null;
  aclPermissions: unknown;
};

type LoginResult = {
  accessToken: string;
  employee: AuthEmployee;
};

type AuthContextValue = {
  employee: AuthEmployee | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<AuthEmployee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setEmployee(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);

    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentEmployee() {
      try {
        const response = await apiFetch("/auth/me");

        if (!response.ok) {
          clearSession();
          return;
        }

        const payload = (await response.json()) as AuthEmployee;

        if (isMounted) {
          setEmployee(payload);
        }
      } catch {
        clearSession();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCurrentEmployee();

    return () => {
      isMounted = false;
    };
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiFetch("/auth/login", {
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Invalid email or password");
    }

    const payload = (await response.json()) as LoginResult;
    setAccessToken(payload.accessToken);
    setEmployee(payload.employee);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      employee,
      isLoading,
      login,
      logout,
    }),
    [employee, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
