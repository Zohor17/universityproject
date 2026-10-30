import { useCallback } from "react";
import { getBookDetails } from "../../../api/books";
import { getEditorBook } from "../../../api/editorBooks";
import { ApiError } from "../../../api/client";
import type { BookDetails } from "../../../shared/types";
import { useFetch } from "../../../shared/hooks/useFetch";

export interface RoutedBook {
  book: BookDetails;
  editable: boolean;
}

function editorBookDetails(bookId: string): RoutedBook | null {
  const book = getEditorBook(bookId);
  if (!book) return null;
  return {
    editable: true,
    book: {
      id: book.id,
      title: book.title,
      description: book.description,
      authors: [book.author],
      subjects: [book.genre],
      rating: null,
      ratingCount: 0,
    },
  };
}

export function useRoutedBook(bookId: string | null, refreshKey: number) {
  const fetcher = useCallback(async (signal: AbortSignal): Promise<RoutedBook> => {
    if (!bookId) throw new ApiError("Книга не найдена.", 404);
    const local = editorBookDetails(bookId);
    if (local) return local;
    const book = await getBookDetails(bookId, signal);
    return { book, editable: false };
  }, [bookId]);

  return useFetch(fetcher, bookId !== null, `${bookId ?? "missing-book"}:${refreshKey}`);
}
