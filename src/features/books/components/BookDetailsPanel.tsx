import type { ApiFailure, BookDetails, LoadStatus } from "../../../shared/types";
import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { ErrorBox } from "../../../shared/components/ErrorBox";
import { Spinner } from "../../../shared/components/Spinner";

export interface BookDetailsPanelProps {
  status: LoadStatus;
  book: BookDetails | null;
  error: ApiFailure | null;
  onRetry: () => void;
  onClose: () => void;
}

export function BookDetailsPanel({ status, book, error, onRetry, onClose }: BookDetailsPanelProps) {
  if (status === "idle") return null;

  return (
    <section className="book-meta-section" aria-labelledby="detail-heading">
      <div className="book-detail__header">
        <h2 className="section-heading" id="detail-heading">Карточка книги</h2>
        <Button variant="secondary" onClick={onClose}>Закрыть</Button>
      </div>
      {status === "loading" && <Spinner label="Загружаем сведения о книге…" />}
      {status === "error" && error && <ErrorBox error={error} onRetry={onRetry} />}
      {status === "empty" && <EmptyState title="Книга не найдена" description="Запросите сведения ещё раз." />}
      {status === "success" && book && (
        <article className="book-detail">
          <header className="book-detail__header">
            <h3>{book.title}</h3>
            <p className="book-detail__caption">Идентификатор Open Library: {book.id}</p>
          </header>
          <section className="book-description" aria-labelledby="description-heading">
            <h4 id="description-heading">Описание</h4>
            <p>{book.description}</p>
          </section>
          <dl className="book-meta">
            <dt className="book-meta__term">Авторы</dt>
            <dd className="book-meta__value">{book.authors.join(", ") || "Не указаны"}</dd>
            <dt className="book-meta__term">Рейтинг</dt>
            <dd className="book-meta__value">{book.rating === null ? "Нет оценок" : `${book.rating.toFixed(2)} (${book.ratingCount})`}</dd>
          </dl>
          <ul aria-label="Темы книги">
            {book.subjects.map((subject) => <li key={subject}>{subject}</li>)}
          </ul>
        </article>
      )}
    </section>
  );
}
