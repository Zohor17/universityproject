import { Outlet } from "react-router";
import { SiteHeader } from "./components/SiteHeader";

export function AppLayout() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="site-main page-stack"><Outlet /></main>
      <footer className="site-footer"><p>BookNest · Open Library</p></footer>
    </div>
  );
}
