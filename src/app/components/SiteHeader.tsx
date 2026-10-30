import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Link, useLocation } from "react-router";
import { Button } from "../../shared/components/Button";

export function SiteHeader() {
  const { user, loginDemo, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const formRoute = pathname === "/books/new" || pathname.endsWith("/edit");
  const catalogRoute = pathname === "/books" || (pathname.startsWith("/books/") && !formRoute);

  return (
    <header className="site-header">
      <p className="site-header__brand"><Link to="/books">BookNest</Link></p>
      <nav className="site-nav" aria-label="Основная навигация">
        <ul className="site-nav__list">
          <li><Link className="site-nav__link" to="/books" aria-current={catalogRoute ? "page" : undefined}>Каталог</Link></li>
          <li><Link className="site-nav__link" to="/wishlist" aria-current={pathname === "/wishlist" ? "page" : undefined}>Мой список</Link></li>
          <li><Link className="site-nav__link" to="/books/new" aria-current={formRoute ? "page" : undefined}>Добавить книгу</Link></li>
          <li><Button variant="secondary" onClick={toggleTheme}>Тема: {mode}</Button></li>
          <li>
            {user
              ? <Button variant="secondary" onClick={logout}>Выйти ({user.name})</Button>
              : <Button variant="secondary" onClick={loginDemo}>Войти (демо)</Button>}
          </li>
        </ul>
      </nav>
    </header>
  );
}
