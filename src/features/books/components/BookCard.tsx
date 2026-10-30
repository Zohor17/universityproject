import { Link } from "react-router";
import type { BookSummary } from "../../../shared/types";
import { Badge } from "../../../shared/components/Badge";
import { Button } from "../../../shared/components/Button";

export interface BookCardProps {
  book: BookSummary;
  saved: boolean;
  onToggleWishlist: (book: BookSummary) => void;
}

export function BookCard({ book, saved, onToggleWishlist }: BookCardProps) {
  const cover = book.coverId === null
    ? <span className="book-card__cover-placeholder">Обложка не найдена</span>
    : <img
        className="book-card__cover"
        src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`}
        alt={`Обложка книги «${book.title}»`}
        width="320"
        height="480"
        loading="lazy"
      />;

  return (
    <article className="book-card">
      <figure className="book-card__figure">{cover}</figure>
      <header className="book-card__header">
        <h3 className="book-card__title">{book.title}</h3>
        <p className="book-card__meta">{book.authors}</p>
      </header>
      <p className="book-card__summary">
        {book.year === null ? "Год издания не указан." : `Первое издание: ${book.year} год.`}
      </p>
      <p className="book-card__status">
        <Badge>{book.rating === null ? "Нет оценок" : `Рейтинг ${book.rating.toFixed(1)}`}</Badge>{" "}
        <Badge tone="accent">{book.hasFullText ? "Полный текст" : `${book.editionCount ?? "Нет данных"} изданий`}</Badge>
      </p>
      <div className="book-card__action">
        <Link className="button-link" to={`/books/${book.id}`}>Подробнее</Link>
        <Button
          variant={saved ? "secondary" : "primary"}
          className="wishlist-toggle"
          aria-pressed={saved}
          onClick={() => onToggleWishlist(book)}
        >
          {saved ? "В моём списке" : "Хочу прочитать"}
        </Button>
      </div>
    </article>
  );
}
