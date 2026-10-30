import type { BookSummary } from "../../../shared/types";
import { Badge } from "../../../shared/components/Badge";
import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";

export interface WishlistPanelProps {
  books: BookSummary[];
  onRemove: (bookId: string) => void;
}

export function WishlistPanel({ books, onRemove }: WishlistPanelProps) {
  return (
    <section className="wishlist-panel" id="wishlist" aria-labelledby="wishlist-heading">
      <h2 className="section-heading" id="wishlist-heading">Мой список <Badge tone="accent">{books.length}</Badge></h2>
      {books.length === 0
        ? <EmptyState title="Список пока пуст" description="Добавьте книгу из каталога, чтобы сохранить её здесь." />
        : (
          <ul className="wishlist-list">
            {books.map((book) => (
              <li className="wishlist-entry" key={book.id}>
                <span className="wishlist-entry__title">{book.title} — {book.authors}</span>
                <Button variant="secondary" className="wishlist-remove" aria-label={`Удалить «${book.title}»`} onClick={() => onRemove(book.id)}>Удалить</Button>
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}
