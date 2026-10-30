import { useAuth } from "../../app/contexts/AuthContext";
import { useTheme } from "../../app/contexts/ThemeContext";
import { Button } from "./Button";

export interface SiteHeaderProps {
  savedCount: number;
}

export function SiteHeader({ savedCount }: SiteHeaderProps) {
  const { user, loginDemo, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();

  return (
    <header className="site-header">
      <p className="site-header__brand"><a href="/">BookNest</a></p>
      <nav className="site-nav" aria-label="Основная навигация">
        <ul className="site-nav__list">
          <li><a className="site-nav__link" href="#catalog" aria-current="page">Каталог</a></li>
          <li><a className="site-nav__link" href="#wishlist">Мой список <span className="wishlist-count" aria-live="polite">{savedCount}</span></a></li>
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
