/**
 * main.tsx — App entry point with React Router.
 *
 * What is React Router?
 * Maps URLs to React components (pages):
 *   /login          → LoginPage
 *   /register       → RegisterPage (public sign-up)
 *   /               → Dashboard (inside Layout with sidebar)
 *   /institutions   → InstitutionsList
 *   /institutions/abc123 → InstitutionDetail
 *   /alerts         → AlertsPage
 *   /upload         → UploadPage
 *
 * What is QueryClientProvider?
 * React Query's context — lets any component use useQuery() to fetch data
 * with automatic caching, refetching, and loading states.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./auth";
import { ThemeProvider } from "./ThemeProvider.tsx";
import "./i18n.ts";
import "./index.css";

// Pages — we'll create these next
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import InstitutionsList from "./pages/Institutions";
import InstitutionDetail from "./pages/InstitutionDetail";
import AlertsPage from "./pages/Alerts";
import UploadPage from "./pages/Upload";
import Chat from "./pages/chat";


// React Query client — caches API responses for 30 seconds
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

/**
 * ProtectedRoute — redirects to /login if not authenticated.
 * Wraps all dashboard pages so unauthenticated users can't access them.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="ucaros-theme">
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes — wrapped in Layout (sidebar + topbar) */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="institutions" element={<InstitutionsList />} />
                <Route path="institutions/:id" element={<InstitutionDetail />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="chat" element={<Chat />} />
                <Route path="alerts" element={<AlertsPage />} />
              </Route>

              {/* Catch-all — redirect unknown URLs to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
