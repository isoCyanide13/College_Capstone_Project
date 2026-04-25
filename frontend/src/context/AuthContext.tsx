"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { saveToken, saveUser, removeToken, getUser } from "@/lib/auth";

const API_BASE = "http://127.0.0.1:8000";

interface User {
  id: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage once on app start
  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }
  }, []);

  async function register(name: string, email: string, password: string) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "student" }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          setError(data.detail[0]?.msg || "Registration failed");
        } else {
          setError(data.detail || "Registration failed");
        }
        return false;
      }
      return await login(email, password);
    } catch {
      setError("Cannot connect to server. Is the backend running?");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          setError(data.detail[0]?.msg || "Login failed");
        } else {
          setError(data.detail || "Login failed");
        }
        return false;
      }
      const userData = { id: data.user_id, name: data.name, role: data.role };
      saveToken(data.access_token);
      saveUser(userData);
      // Update shared state — every component instantly knows
      setUser(userData);
      setIsAuthenticated(true);
      router.push("/dashboard");
      return true;
    } catch {
      setError("Cannot connect to server. Is the backend running?");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    removeToken();
    // Update shared state — every component instantly knows
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoading, error, setError,
      login, register, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// This is what every component calls instead of useAuth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}