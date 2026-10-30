import { useEffect, useState } from "react";
import type { BookSummary } from "../types";

const STORAGE_KEY = "booknest.openlibrary.wishlist.v1";

function isBookSummary(value: unknown): value is BookSummary {
  if (typeof value !== "object" || value === null) return false;
  const book = value as Partial<BookSummary>;
  return typeof book.id === "string"
    && typeof book.key === "string"
    && typeof book.title === "string"
    && typeof book.authors === "string";
}

function readWishlist(): BookSummary[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isBookSummary).map((book) => ({
      ...book,
      year: Number.isInteger(book.year) ? book.year : null,
      coverId: Number.isInteger(book.coverId) ? book.coverId : null,
      editionCount: Number.isInteger(book.editionCount) ? book.editionCount : null,
      rating: typeof book.rating === "number" ? book.rating : null,
      subjects: Array.isArray(book.subjects) ? book.subjects : [],
      hasFullText: book.hasFullText === true,
    }));
  } catch {
    return [];
  }
}

export function useWishlist() {
  const [books, setBooks] = useState<BookSummary[]>(readWishlist);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch {
      // Keep the list in memory when browser storage is unavailable.
    }
  }, [books]);

  function toggle(book: BookSummary): void {
    setBooks((current) => current.some((entry) => entry.id === book.id)
      ? current.filter((entry) => entry.id !== book.id)
      : [...current, book]);
  }

  function remove(bookId: string): void {
    setBooks((current) => current.filter((book) => book.id !== bookId));
  }

  return { books, toggle, remove };
}
