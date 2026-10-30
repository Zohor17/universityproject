import { useState } from "react";
import { BookDetailsPanel } from "./components/BookDetailsPanel";
import { BookList } from "./components/BookList";
import { EmptyState } from "./components/EmptyState";
import { ErrorBox } from "./components/ErrorBox";
import { FiltersPanel } from "./components/FiltersPanel";
import { Pagination } from "./components/Pagination";
import { SiteHeader } from "./components/SiteHeader";
import { Spinner } from "./components/Spinner";
import { WishlistPanel } from "./components/WishlistPanel";
import { filterAndSortBooks } from "./lib/books";
import { useBookDetails, useBooks } from "./lib/useBooks";
import { useDebouncedValue } from "./lib/useDebouncedValue";
import { useWishlist } from "./lib/useWishlist";
import type { SortOrder } from "./types";

export default function App() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState<SortOrder>("relevance");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const debouncedQuery = useDebouncedValue(query.trim());
  const catalog = useBooks(debouncedQuery, page, refreshKey);
  const detail = useBookDetails(selectedBookId, detailRefreshKey);
  const wishlist = useWishlist();
  const visibleBooks = filterAndSortBooks(catalog.books, { genre, sort, availableOnly });
  const totalPages = Math.ceil(catalog.total / 20);
  const savedIds = new Set(wishlist.books.map((book) => book.id));

  function updateQuery(value: string): void {
    setQuery(value);
    setPage(1);
    setSelectedBookId(null);
  }

  return (
    <div className="app-shell">
      <SiteHeader savedCount={wishlist.books.length} />
      <main className="site-main catalog-page" id="catalog-app">
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
            <EmptyState title={debouncedQuery.length < 2 ? "Введите запрос" : "Ничего не найдено"} description={debouncedQuery.length < 2 ? "Минимальная длина запроса — два символа." : "Попробуйте изменить запрос."} />
          )}
          {catalog.status === "success" && visibleBooks.length === 0 && (
            <EmptyState title="Нет совпадений в этой выдаче" description="Измените жанр или снимите ограничение по полному тексту." />
          )}
          {catalog.status === "success" && visibleBooks.length > 0 && (
            <>
              <p className="results-count">Показано {visibleBooks.length} из {catalog.total} записей.</p>
              <BookList books={visibleBooks} savedIds={savedIds} onToggleWishlist={wishlist.toggle} onOpenDetails={setSelectedBookId} />
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
        <WishlistPanel books={wishlist.books} onRemove={wishlist.remove} />
      </main>
      <footer className="site-footer"><p>BookNest · данные каталога предоставлены Open Library</p></footer>
    </div>
  );
}
