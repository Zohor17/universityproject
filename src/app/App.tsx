import { useWishlist } from "../features/wishlist/hooks/useWishlist";
import { BooksPage } from "../pages/BooksPage";
import { WishlistPage } from "../pages/WishlistPage";
import { SiteHeader } from "../shared/components/SiteHeader";

export default function App() {
  const wishlist = useWishlist();

  return (
    <div className="app-shell">
      <SiteHeader savedCount={wishlist.books.length} />
      <main className="site-main catalog-page">
        <BooksPage wishlist={wishlist.books} onToggleWishlist={wishlist.toggle} />
        <WishlistPage books={wishlist.books} onRemove={wishlist.remove} />
      </main>
      <footer className="site-footer"><p>BookNest · данные каталога предоставлены Open Library</p></footer>
    </div>
  );
}
