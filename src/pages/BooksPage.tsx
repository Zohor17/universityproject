import { useState } from "react";
import type { BookSummary, SortOrder } from "../shared/types";
import { BookDetailsPanel } from "../features/books/components/BookDetailsPanel";
import { BookList } from "../features/books/components/BookList";
import { FiltersPanel } from "../features/books/components/FiltersPanel";
import { Pagination } from "../features/books/components/Pagination";
import { filterAndSortBooks } from "../features/books/lib/books";
import { useBookDetails, useBooks } from "../features/books/hooks/useBooks";
import { EmptyState } from "../shared/components/EmptyState";
import { ErrorBox } from "../shared/components/ErrorBox";
import { Spinner } from "../shared/components/Spinner";
import { useDebounce } from "../shared/hooks/useDebounce";

export interface BooksPageProps {
  wishlist: BookSummary[];
  onToggleWishlist: (book: BookSummary) => void;
}

export function BooksPage({ wishlist, onToggleWishlist }: BooksPageProps) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState<SortOrder>("relevance");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const debouncedQuery = useDebounce(query.trim());
  const catalog = useBooks(debouncedQuery, page, refreshKey);
  const detail = useBookDetails(selectedBookId, detailRefreshKey);
  const visibleBooks = filterAndSortBooks(catalog.books, { genre, sort, availableOnly });
  const totalPages = Math.ceil(catalog.total / 20);
  const savedIds = new Set(wishlist.map((book) => book.id));

  function updateQuery(value: string): void {
    setQuery(value);
    setPage(1);
    setSelectedBookId(null);
  }

  return (
    <>
      <h1 className="page-title" id="catalog">Каталог книг</h1>
      <p className="page-intro">Ищите книги в Open Library, настраивайте выдачу и сохраняйте интересное.</p>
      <FiltersPanel
        query={query}
        genre={genre}
        sort={sort}
        availableOnly={availableOnly}
        onQueryChange={updateQuery}
        onGenreChange={setGenre}
        onSortChange={setSort}
        onAvailableChange={setAvailableOnly}
        onSearch={() => setRefreshKey((current) => current + 1)}
      />
      <section className="book-results" aria-labelledby="results-heading" aria-busy={catalog.status === "loading"}>
        <h2 className="section-heading" id="results-heading">Книги Open Library</h2>
        {catalog.status === "loading" && <Spinner label="Ищем книги в Open Library…" />}
        {catalog.status === "error" && catalog.error && (
          <ErrorBox error={catalog.error} onRetry={() => setRefreshKey((current) => current + 1)} />
        )}
        {catalog.status === "empty" && (
          <EmptyState title={debouncedQuery.length < 2 ? "Начните поиск" : "Ничего не найдено"} description={debouncedQuery.length < 2 ? "Введите минимум два символа." : "Попробуйте изменить запрос."} />
        )}
        {catalog.status === "success" && visibleBooks.length === 0 && (
          <EmptyState title="Нет совпадений в этой выдаче" description="Измените жанр или снимите ограничение по полному тексту." />
        )}
        {catalog.status === "success" && visibleBooks.length > 0 && (
          <>
            <p className="results-count">Показано {visibleBooks.length} из {catalog.total} записей.</p>
            <BookList books={visibleBooks} savedIds={savedIds} onToggleWishlist={onToggleWishlist} onOpenDetails={setSelectedBookId} />
          </>
        )}
        <Pagination page={page} totalPages={totalPages} disabled={catalog.status === "loading"} onPageChange={setPage} />
        <BookDetailsPanel
          status={detail.status}
          book={detail.book}
          error={detail.error}
          onRetry={() => setDetailRefreshKey((current) => current + 1)}
          onClose={() => setSelectedBookId(null)}
        />
      </section>
    </>
  );
}
