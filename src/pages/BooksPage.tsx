import { useState } from "react";
import { useSearchParams } from "react-router";
import { BookList } from "../features/books/components/BookList";
import { FiltersPanel } from "../features/books/components/FiltersPanel";
import { Pagination } from "../features/books/components/Pagination";
import { useBooks } from "../features/books/hooks/useBooks";
import { filterAndSortBooks } from "../features/books/lib/books";
import { useWishlist } from "../features/wishlist/hooks/useWishlist";
import { EmptyState } from "../shared/components/EmptyState";
import { ErrorBox } from "../shared/components/ErrorBox";
import { Spinner } from "../shared/components/Spinner";
import { useDebounce } from "../shared/hooks/useDebounce";
import type { SortOrder } from "../shared/types";

const sortOrders: SortOrder[] = ["relevance", "title", "year", "rating"];

function getPage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function BooksPage() {
  const [params, setParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const wishlist = useWishlist();
  const query = params.get("q") ?? "";
  const genre = params.get("genre") ?? "all";
  const rawSort = params.get("sort");
  const sort: SortOrder = rawSort && sortOrders.includes(rawSort as SortOrder) ? rawSort as SortOrder : "relevance";
  const availableOnly = params.get("available") === "1";
  const page = getPage(params.get("page"));
  const debouncedQuery = useDebounce(query.trim());
  const catalog = useBooks(debouncedQuery, page, refreshKey);
  const visibleBooks = filterAndSortBooks(catalog.books, { genre, sort, availableOnly });
  const totalPages = Math.ceil(catalog.total / 20);
  const savedIds = new Set(wishlist.books.map((book) => book.id));

  function updateParams(values: Record<string, string>): void {
    setParams((current) => {
      const next = new URLSearchParams(current);
      for (const [key, value] of Object.entries(values)) {
        const isDefault = value === ""
          || (key === "page" && value === "1")
          || (key === "genre" && value === "all")
          || (key === "sort" && value === "relevance")
          || (key === "available" && value === "0");
        if (isDefault) next.delete(key);
        else next.set(key, value);
      }
      return next;
    }, { replace: true });
  }

  function updateQuery(value: string): void {
    updateParams({ q: value, page: "1" });
  }

  return (
    <div className="catalog-page">
      <h1 className="page-title" id="catalog">Каталог книг</h1>
      <p className="page-intro">Ищите книги в Open Library, настраивайте выдачу и сохраняйте интересное.</p>
      <FiltersPanel
        query={query}
        genre={genre}
        sort={sort}
        availableOnly={availableOnly}
        onQueryChange={updateQuery}
        onGenreChange={(value) => updateParams({ genre: value, page: "1" })}
        onSortChange={(value) => updateParams({ sort: value, page: "1" })}
        onAvailableChange={(value) => updateParams({ available: value ? "1" : "0", page: "1" })}
        onSearch={() => setRefreshKey((current) => current + 1)}
      />
      <section className="book-results" aria-labelledby="results-heading" aria-busy={catalog.status === "loading"}>
        <h2 className="section-heading" id="results-heading">Книги Open Library</h2>
        {catalog.status === "loading" && <Spinner label="Ищем книги в Open Library…" />}
        {catalog.status === "error" && catalog.error && <ErrorBox error={catalog.error} onRetry={() => setRefreshKey((current) => current + 1)} />}
        {catalog.status === "empty" && <EmptyState title={debouncedQuery.length < 2 ? "Начните поиск" : "Ничего не найдено"} description={debouncedQuery.length < 2 ? "Введите минимум два символа." : "Попробуйте изменить запрос."} />}
        {catalog.status === "success" && visibleBooks.length === 0 && <EmptyState title="Нет совпадений в этой выдаче" description="Измените жанр или снимите ограничение по полному тексту." />}
        {catalog.status === "success" && visibleBooks.length > 0 && (
          <>
            <p className="results-count">Показано {visibleBooks.length} из {catalog.total} записей.</p>
            <BookList books={visibleBooks} savedIds={savedIds} onToggleWishlist={wishlist.toggle} />
          </>
        )}
        <Pagination page={page} totalPages={totalPages} disabled={catalog.status === "loading"} onPageChange={(value) => updateParams({ page: String(value) })} />
      </section>
    </div>
  );
}
