function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function createBookCard(book, genres) {
  const article = document.createElement("article");
  article.className = "book-card";

  const header = document.createElement("header");
  header.className = "book-card__header";
  header.append(createTextElement("h3", "book-card__title", book.title));
  header.append(createTextElement("p", "book-card__meta", book.author));

  const summary = createTextElement("p", "book-card__summary", `Издание ${book.year} года · ${genres[book.genre] ?? book.genre}`);
  const status = createTextElement(
    "p",
    "book-card__status",
    `Рейтинг ${book.rating.toFixed(1)} · ${book.available ? "Доступна" : "Сейчас выдана"}`,
  );

  const action = document.createElement("p");
  action.className = "book-card__action";
  const wanted = document.createElement("button");
  wanted.className = "wishlist-toggle";
  wanted.type = "button";
  wanted.dataset.action = "toggle-wishlist";
  wanted.dataset.bookId = book.id;
  wanted.setAttribute("aria-pressed", "false");
  wanted.textContent = "Хочу прочитать";
  action.append(wanted);

  article.append(header, summary, status, action);
  return article;
}

function createWishlistEntry(book) {
  const item = document.createElement("li");
  item.className = "wishlist-entry";
  item.append(createTextElement("span", "wishlist-entry__title", `${book.title} — ${book.author}`));

  const remove = document.createElement("button");
  remove.className = "wishlist-remove";
  remove.type = "button";
  remove.dataset.action = "remove-wishlist";
  remove.dataset.bookId = book.id;
  remove.setAttribute("aria-label", `Удалить книгу «${book.title}» из списка`);
  remove.textContent = "Удалить";
  item.append(remove);
  return item;
}

export function render(state) {
  const catalog = document.querySelector(".book-listing");
  const wishlist = document.querySelector("#wishlist-list");
  const resultCount = document.querySelector("#results-count");
  const headerWishlistCount = document.querySelector("#wishlist-count");
  const sectionWishlistCount = document.querySelector("#wishlist-section-count");
  const genreNames = Object.fromEntries(state.genres.map(({ id, label }) => [id, label]));
  const wantedIds = new Set(state.wishlist);

  catalog.querySelectorAll(".book-card, .catalog-empty").forEach((element) => element.remove());
  resultCount.textContent = `Найдено книг: ${state.visibleBooks.length}`;

  if (state.visibleBooks.length === 0) {
    catalog.append(createTextElement("p", "catalog-empty", "Ничего не найдено. Измените запрос или сбросьте фильтры."));
  } else {
    const cards = document.createDocumentFragment();
    state.visibleBooks.forEach((book) => {
      const card = createBookCard(book, genreNames);
      const button = card.querySelector('[data-action="toggle-wishlist"]');
      const isWanted = wantedIds.has(book.id);
      button.setAttribute("aria-pressed", String(isWanted));
      button.textContent = isWanted ? "В моём списке" : "Хочу прочитать";
      cards.append(card);
    });
    catalog.append(cards);
  }

  const wantedBooks = state.wishlistBooks;
  headerWishlistCount.textContent = String(wantedBooks.length);
  sectionWishlistCount.textContent = String(wantedBooks.length);
  wishlist.replaceChildren();

  if (wantedBooks.length === 0) {
    wishlist.append(createTextElement("li", "wishlist-empty", "Пока нет книг в списке. Нажмите «Хочу прочитать» на карточке."));
  } else {
    const entries = document.createDocumentFragment();
    wantedBooks.forEach((book) => entries.append(createWishlistEntry(book)));
    wishlist.append(entries);
  }
}
