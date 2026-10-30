import { useEffect, useState } from "react";
import { ApiError } from "../api/client";
import { getBookDetails, searchBooks } from "../api/books";
import type { ApiFailure, BookDetails, BookSummary, LoadStatus } from "../types";

interface BooksState {
  status: LoadStatus;
  books: BookSummary[];
  total: number;
  error: ApiFailure | null;
}

const initialState: BooksState = { status: "empty", books: [], total: 0, error: null };

function getFailure(error: unknown): ApiFailure {
  if (error instanceof ApiError && error.status !== undefined) {
    return {
      message: error.message,
      status: error.status,
      kind: error.status >= 500 ? "server" : "client",
    };
  }
  if (error instanceof ApiError) return { message: error.message, kind: "network" };
  return { message: "Не удалось загрузить книги. Повторите попытку.", kind: "unknown" };
}

export function useBooks(query: string, page: number, refreshKey: number) {
  const [state, setState] = useState<BooksState>(initialState);

  useEffect(() => {
    if (query.trim().length < 2) {
      setState({ ...initialState, status: "empty" });
      return undefined;
    }

    const controller = new AbortController();
    setState({ ...initialState, status: "loading" });

    async function load(): Promise<void> {
      try {
        const result = await searchBooks(query, page, controller.signal);
        if (controller.signal.aborted) return;
        setState({
          status: result.books.length === 0 ? "empty" : "success",
          books: result.books,
          total: result.total,
          error: null,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setState({ status: "error", books: [], total: 0, error: getFailure(error) });
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [query, page, refreshKey]);

  return state;
}

export function useBookDetails(bookId: string | null, refreshKey: number) {
  const [state, setState] = useState<{
    status: LoadStatus;
    book: BookDetails | null;
    error: ApiFailure | null;
  }>({ status: "idle", book: null, error: null });

  useEffect(() => {
    if (!bookId) {
      setState({ status: "idle", book: null, error: null });
      return undefined;
    }
    const controller = new AbortController();
    setState({ status: "loading", book: null, error: null });

    async function load(): Promise<void> {
      try {
        const book = await getBookDetails(bookId, controller.signal);
        if (!controller.signal.aborted) setState({ status: "success", book, error: null });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!controller.signal.aborted) setState({ status: "error", book: null, error: getFailure(error) });
      }
    }

    void load();
    return () => controller.abort();
  }, [bookId, refreshKey]);

  return state;
}
