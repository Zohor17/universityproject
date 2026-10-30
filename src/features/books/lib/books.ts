import type { BookSummary, SortOrder } from "../../../shared/types";

export interface BookFilters {
  genre: string;
  availableOnly: boolean;
  sort: SortOrder;
}

export function filterAndSortBooks(books: BookSummary[], filters: BookFilters): BookSummary[] {
  const filtered = books.filter((book) => {
    const matchesGenre = filters.genre === "all"
      || book.subjects.some((subject) => subject.toLocaleLowerCase().includes(filters.genre));
    return matchesGenre && (!filters.availableOnly || book.hasFullText);
  });

  return [...filtered].sort((left, right) => {
    if (filters.sort === "title") return left.title.localeCompare(right.title, "ru");
    if (filters.sort === "year") return (right.year ?? 0) - (left.year ?? 0);
    if (filters.sort === "rating") return (right.rating ?? 0) - (left.rating ?? 0);
    return 0;
  });
}
