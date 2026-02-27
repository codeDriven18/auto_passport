import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { JobsPage } from "./pages/JobsPage";
import { JobDetailPage } from "./pages/JobDetailPage";
import { JobFormPage } from "./pages/JobFormPage";
import { ImportPage } from "./pages/ImportPage";
import { TagsPage } from "./pages/TagsPage";
import { SourcesPage } from "./pages/SourcesPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ToastProvider, useToast } from "./components/ToastProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { api } from "./api";

function Header() {
  const { push } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const seedDemo = async () => {
    const result = await api.seedDemo();
    push(result.seeded ? "Demo data seeded" : "Demo data already exists");
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <span className="brand-badge">JP</span>
          Local Job Platform
        </div>
        <nav className="nav-links">
          <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/gigs">
            Gigs
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/it">
            IT Jobs
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/import">
            Import
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/profile">
            Profile
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/analytics">
            Analytics
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/tags">
            Tags
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/sources">
            Sources
          </NavLink>
        </nav>
        <div className="actions">
          <button
            className="icon-button"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 4.5V2m0 20v-2.5m7.5-7.5H22m-20 0h2.5m12.02-5.52 1.77-1.77m-13.54 13.54 1.77-1.77m0-9.99-1.77-1.77m13.54 13.54-1.77-1.77M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M21 14.5A8.5 8.5 0 1 1 9.5 3a6.5 6.5 0 0 0 11.5 11.5Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <button className="button accent" onClick={seedDemo}>
            Seed demo
          </button>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <div className="app-shell">
        <Header />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/gigs" replace />} />
            <Route path="/gigs" element={<JobsPage branch="Gigs" />} />
            <Route path="/it" element={<JobsPage branch="ItJobs" />} />
            <Route path="/jobs/new" element={<JobFormPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/jobs/:id/edit" element={<JobFormPage />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="*" element={<Navigate to="/gigs" replace />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </ToastProvider>
  );
}
