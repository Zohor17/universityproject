import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useRoutedBook } from "../features/books/hooks/useRoutedBook";
import { BookDetailsPanel } from "../features/books/components/BookDetailsPanel";
import { ErrorBox } from "../shared/components/ErrorBox";
import { Spinner } from "../shared/components/Spinner";

export function BookDetailsPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const result = useRoutedBook(bookId ?? null, refreshKey);

  if (result.status === "error" && result.error?.status === 404) {
    return (
      <section className="page-stack" aria-labelledby="detail-404">
        <h1 className="page-title" id="detail-404">404 — книга не найдена</h1>
        <p>{result.error.message}</p>
        <Link className="button-link" to="/books">Вернуться в каталог</Link>
      </section>
    );
  }

  return (
    <section className="page-stack" aria-labelledby="book-detail-title">
      <h1 className="page-title" id="book-detail-title">{result.data?.book.title ?? "Карточка книги"}</h1>
      {result.status === "loading" && <Spinner label="Загружаем карточку книги…" />}
      {result.status === "error" && result.error && <ErrorBox error={result.error} onRetry={() => setRefreshKey((value) => value + 1)} />}
      {result.status === "empty" && <p>В адресе отсутствует идентификатор книги.</p>}
      {result.status === "success" && result.data && (
        <>
          {result.data.editable && <Link className="button-link" to={`/books/${result.data.book.id}/edit`}>Редактировать книгу</Link>}
          <BookDetailsPanel
            status="success"
            book={result.data.book}
            error={null}
            onRetry={() => setRefreshKey((value) => value + 1)}
            onClose={() => navigate("/books")}
          />
        </>
      )}
    </section>
  );
}
