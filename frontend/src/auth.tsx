/**
 * auth.tsx — Authentication context for the entire app.
 *
 * What is React Context?
 * A way to share data (like "who is logged in") across ALL components
 * without passing it through props. Any component can call useAuth()
 * to get the current user, login, or logout functions.
 *
 * How it works:
 * 1. App starts → checks if there's a saved token in localStorage
 * 2. If yes → fetches user info from /api/auth/me
 * 3. Login → sends credentials, saves token, stores user
 * 4. Logout → clears token and user, redirects to /login
 */
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

import api from "./api";

// Shape of the user object
interface User {
  id: string;
  email: string;
  full_name: string;
  role: "president" | "dean" | "admin" | "researcher";
  institution_id: string | null;
}

// Shape of what useAuth() returns
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isRole: (...roles: string[]) => boolean;
  updateInstitution: (institutionId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On app start, check if we have a saved token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/api/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // OAuth2 spec requires form data with 'username' field
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);

    const res = await api.post("/api/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const token = res.data.access_token;
    localStorage.setItem("token", token);

    // Fetch full user info
    const me = await api.get("/api/auth/me");
    setUser(me.data);
    localStorage.setItem("user", JSON.stringify(me.data));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const isRole = (...roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };

  const updateInstitution = async (institutionId: string) => {
    const res = await api.put("/api/auth/me/institution", { institution_id: institutionId });
    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isRole, updateInstitution }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook — use this in any component to access auth
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
