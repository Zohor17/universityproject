export interface SiteHeaderProps {
  savedCount: number;
}

export function SiteHeader({ savedCount }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <p className="site-header__brand"><a href="/">BookNest</a></p>
      <nav className="site-nav" aria-label="Основная навигация">
        <ul className="site-nav__list">
          <li><a className="site-nav__link" href="#catalog" aria-current="page">Каталог</a></li>
          <li><a className="site-nav__link" href="#wishlist">Мой список <span className="wishlist-count" aria-live="polite">{savedCount}</span></a></li>
        </ul>
      </nav>
    </header>
  );
}
