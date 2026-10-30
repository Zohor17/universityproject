function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function createCover(book) {
  const figure = document.createElement("figure");
  figure.className = "book-card__figure";

  if (book.coverId !== null) {
    const image = document.createElement("img");
    image.className = "book-card__cover";
    image.src = `https://covers.openlibrary.org/b/id/${encodeURIComponent(book.coverId)}-M.jpg`;
    image.alt = `Обложка книги «${book.title}»`;
    image.width = 320;
    image.height = 480;
    image.loading = "lazy";
    figure.append(image);
  } else {
    figure.append(createTextElement("span", "book-card__cover-placeholder", "Обложка не найдена"));
  }

  return figure;
}

function createBookCard(book, wishlistIds) {
  const article = document.createElement("article");
  article.className = "book-card";
  article.append(createCover(book));

  const header = document.createElement("header");
  header.className = "book-card__header";
  const title = document.createElement("h3");
  title.className = "book-card__title";
  const detailLink = document.createElement("a");
  detailLink.href = `book.html?${new URLSearchParams({ id: book.id, ...(book.coverId === null ? {} : { cover: String(book.coverId) }) })}`;
  detailLink.textContent = book.title;
  title.append(detailLink);
  header.append(title, createTextElement("p", "book-card__meta", book.authors));

  const summary = createTextElement(
    "p",
    "book-card__summary",
    book.year === null ? "Год издания не указан." : `Первое издание: ${book.year} год.`,
  );
  const ratingText = book.rating === null ? "Оценок пока нет" : `Рейтинг ${book.rating.toFixed(1)}`;
  const status = createTextElement("p", "book-card__status", `${ratingText} · ${book.editionCount ?? "Нет данных"} изданий`);

  const action = document.createElement("p");
  action.className = "book-card__action";
  const wanted = document.createElement("button");
  const isWanted = wishlistIds.has(book.id);
  wanted.className = "wishlist-toggle";
  wanted.type = "button";
  wanted.dataset.action = "toggle-wishlist";
  wanted.dataset.bookId = book.id;
  wanted.setAttribute("aria-pressed", String(isWanted));
  wanted.textContent = isWanted ? "В моём списке" : "Хочу прочитать";
  action.append(wanted);

  article.append(header, summary, status, action);
  return article;
}

function createWishlistEntry(book) {
  const item = document.createElement("li");
  item.className = "wishlist-entry";
  item.append(createTextElement("span", "wishlist-entry__title", `${book.title} — ${book.authors}`));

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

export function renderCatalog(state) {
  const catalog = document.querySelector(".book-listing");
  const apiState = document.querySelector("#api-state");
  const resultCount = document.querySelector("#results-count");
  const pagination = document.querySelector("#pagination");
  const wishlistList = document.querySelector("#wishlist-list");
  const headerWishlistCount = document.querySelector("#wishlist-count");
  const sectionWishlistCount = document.querySelector("#wishlist-section-count");
  const wishlistIds = new Set(state.wishlist.map((book) => book.id));

  catalog.setAttribute("aria-busy", String(state.status === "loading"));
  apiState.className = `api-state api-state--${state.status}`;
  apiState.replaceChildren(document.createTextNode(state.message));
  if (state.status === "error") {
    const retry = document.createElement("button");
    retry.className = "button-secondary";
    retry.type = "button";
    retry.dataset.action = "retry-search";
    retry.textContent = "Повторить";
    apiState.append(document.createTextNode(" "), retry);
  }

  catalog.querySelectorAll(".book-card, .catalog-empty").forEach((element) => element.remove());
  resultCount.textContent = state.status === "success"
    ? `Показано ${state.results.length} из ${state.total} записей.`
    : "";

  if (state.status === "success") {
    const cards = document.createDocumentFragment();
    state.results.forEach((book) => cards.append(createBookCard(book, wishlistIds)));
    catalog.append(cards);
  } else if (state.status === "empty" && state.query.trim().length >= 2 && state.message.includes("не найдено")) {
    catalog.append(createTextElement("p", "catalog-empty", "Попробуйте изменить запрос."));
  }

  pagination.hidden = state.status !== "success" || state.totalPages <= 1;
  const previous = pagination.querySelector('[data-action="previous-page"]');
  const next = pagination.querySelector('[data-action="next-page"]');
  const pageStatus = pagination.querySelector("#page-status");
  previous.disabled = state.page <= 1;
  next.disabled = state.page >= state.totalPages;
  pageStatus.textContent = state.totalPages > 0 ? `Страница ${state.page} из ${state.totalPages}` : "";

  headerWishlistCount.textContent = String(state.wishlist.length);
  sectionWishlistCount.textContent = String(state.wishlist.length);
  wishlistList.replaceChildren();
  if (state.wishlist.length === 0) {
    wishlistList.append(createTextElement("li", "wishlist-empty", "Пока нет книг в списке. Нажмите «Хочу прочитать» на карточке."));
  } else {
    const entries = document.createDocumentFragment();
    state.wishlist.forEach((book) => entries.append(createWishlistEntry(book)));
    wishlistList.append(entries);
  }
}

export function renderBookPage(state) {
  const status = document.querySelector("#detail-state");
  const article = document.querySelector("#book-detail");
  status.className = `api-state api-state--${state.status}`;
  status.replaceChildren(document.createTextNode(state.message));
  article.hidden = state.status !== "success";

  if (state.status === "error") {
    const retry = document.createElement("button");
    retry.className = "button-secondary";
    retry.type = "button";
    retry.dataset.action = "retry-detail";
    retry.textContent = "Повторить";
    status.append(document.createTextNode(" "), retry);
  }

  if (state.status !== "success") return;

  const { book } = state;
  document.title = `${book.title} — BookNest`;
  document.querySelector("#detail-title").textContent = book.title;
  document.querySelector("#detail-author").textContent = book.authors.length > 0
    ? `Автор${book.authors.length > 1 ? "ы" : ""}: ${book.authors.join(", ")}`
    : "Автор не указан в Open Library.";
  document.querySelector("#detail-rating").textContent = book.rating === null ? "Нет оценок" : book.rating.toFixed(2);
  document.querySelector("#detail-rating-count").textContent = String(book.ratingCount);
  document.querySelector("#detail-description").textContent = book.description;

  const subjects = document.querySelector("#detail-subjects");
  subjects.replaceChildren();
  if (book.subjects.length === 0) {
    subjects.append(createTextElement("li", "", "Темы не указаны."));
  } else {
    const subjectItems = document.createDocumentFragment();
    book.subjects.forEach((subject) => subjectItems.append(createTextElement("li", "", subject)));
    subjects.append(subjectItems);
  }

  const authors = document.querySelector("#detail-authors");
  authors.replaceChildren();
  if (book.authors.length === 0) {
    authors.textContent = "Не указаны";
  } else {
    const links = document.createDocumentFragment();
    book.authors.forEach((authorId, index) => {
      if (index > 0) links.append(document.createTextNode(", "));
      const link = document.createElement("a");
      link.href = `https://openlibrary.org/authors/${encodeURIComponent(authorId)}`;
      link.textContent = authorId;
      links.append(link);
    });
    authors.append(links);
  }

  const coverId = new URLSearchParams(window.location.search).get("cover");
  const figure = document.querySelector("#detail-figure");
  const cover = document.querySelector("#detail-cover");
  figure.hidden = !coverId;
  if (coverId) {
    cover.src = `https://covers.openlibrary.org/b/id/${encodeURIComponent(coverId)}-L.jpg`;
    cover.alt = `Обложка книги «${book.title}»`;
  }
}
