const titleCollator = new Intl.Collator("ru", { sensitivity: "base", numeric: true });

export function filterBooks(books, filters) {
  const query = filters.query.trim().toLocaleLowerCase("ru");

  return books.filter((book) => {
    const matchesQuery = query.length === 0
      || book.title.toLocaleLowerCase("ru").includes(query)
      || book.author.toLocaleLowerCase("ru").includes(query);
    const matchesGenre = filters.genre === "all" || book.genre === filters.genre;
    const matchesAvailability = !filters.availableOnly || book.available;

    return matchesQuery && matchesGenre && matchesAvailability;
  });
}

export function sortBooks(books, sortBy) {
  const copy = [...books];

  if (sortBy === "year") {
    return copy.sort((first, second) => second.year - first.year || titleCollator.compare(first.title, second.title));
  }

  if (sortBy === "rating") {
    return copy.sort((first, second) => second.rating - first.rating || titleCollator.compare(first.title, second.title));
  }

  return copy.sort((first, second) => titleCollator.compare(first.title, second.title));
}

export function getVisibleBooks(books, filters) {
  return sortBooks(filterBooks(books, filters), filters.sortBy);
}

export function getWishlistBooks(books, wishlistIds) {
  const wantedIds = new Set(wishlistIds);
  return books.filter((book) => wantedIds.has(book.id));
}
