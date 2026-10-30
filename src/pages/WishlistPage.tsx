import type { BookSummary } from "../shared/types";
import { WishlistPanel } from "../features/wishlist/components/WishlistPanel";

export interface WishlistPageProps {
  books: BookSummary[];
  onRemove: (bookId: string) => void;
}

export function WishlistPage({ books, onRemove }: WishlistPageProps) {
  return <WishlistPanel books={books} onRemove={onRemove} />;
}
