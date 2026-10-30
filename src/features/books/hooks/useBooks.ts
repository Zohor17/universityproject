import { useCallback } from "react";
import { getBookDetails, searchBooks } from "../../../api/books";
import type { BookDetails } from "../../../shared/types";
import { useFetch } from "../../../shared/hooks/useFetch";

export function useBooks(query: string, page: number, refreshKey: number) {
  const fetcher = useCallback(
    (signal: AbortSignal) => searchBooks(query, page, signal),
    [query, page],
  );
  const result = useFetch(fetcher, query.trim().length >= 2, `${query}:${page}:${refreshKey}`);
  const payload = result.data;

  return {
    status: result.status === "success" && payload?.books.length === 0 ? "empty" : result.status,
    books: payload?.books ?? [],
    total: payload?.total ?? 0,
    error: result.error,
  };
}

export function useBookDetails(bookId: string | null, refreshKey: number) {
  const fetcher = useCallback(
    (signal: AbortSignal) => (bookId ? getBookDetails(bookId, signal) : Promise.resolve<BookDetails | null>(null)),
    [bookId],
  );
  const result = useFetch(fetcher, bookId !== null, `${bookId ?? ""}:${refreshKey}`);

  return {
    status: result.status,
    book: result.data,
    error: result.error,
  };
}
