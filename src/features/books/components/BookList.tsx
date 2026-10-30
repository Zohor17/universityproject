import type { BookSummary } from "../../../shared/types";
import { BookCard } from "./BookCard";

export interface BookListProps {
  books: BookSummary[];
  savedIds: ReadonlySet<string>;
  onToggleWishlist: (book: BookSummary) => void;
  onOpenDetails: (bookId: string) => void;
}

export function BookList({ books, savedIds, onToggleWishlist, onOpenDetails }: BookListProps) {
  return (
    <div className="book-listing">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          saved={savedIds.has(book.id)}
          onToggleWishlist={onToggleWishlist}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </div>
  );
}
