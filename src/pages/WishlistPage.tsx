import { WishlistPanel } from "../features/wishlist/components/WishlistPanel";
import { useWishlist } from "../features/wishlist/hooks/useWishlist";

export function WishlistPage() {
  const wishlist = useWishlist();
  return (
    <section className="page-stack" aria-labelledby="wishlist-page-heading">
      <h1 className="page-title" id="wishlist-page-heading">Список желаемого</h1>
      <WishlistPanel books={wishlist.books} onRemove={wishlist.remove} />
    </section>
  );
}
