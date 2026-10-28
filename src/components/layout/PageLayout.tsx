import type { ReactNode } from "react";
import { CalendarDays, LayoutGrid } from "lucide-react";
import "./PageLayout.css";
export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-layout">
      <header className="workspace-header">
        <div className="workspace-title">
          <span className="workspace-icon">
            <CalendarDays />
          </span>
          <span>Meeting rooms</span>
        </div>
        <div className="workspace-label">
          <span>Studio workspace</span>
          <span className="demo-label">Local demo</span>
        </div>
      </header>
      <main className="page-main">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <LayoutGrid size={17} />
          <span>Workspace</span>
          <span>/</span>
          <strong>Meeting rooms</strong>
        </nav>
        {children}
      </main>
      <footer className="page-footer">
        <span>torosyan-hakob</span>
        <p>Thanks for your review!</p>
      </footer>
    </div>
  );
}
