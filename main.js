import { ApiError } from "./api/client.js";
import { searchBooks } from "./api/books.js";
import { renderCatalog } from "./ui/render.js";

const wishlistStorageKey = "booknest.openlibrary.wishlist.v1";
const filtersForm = document.querySelector(".filters-form");
const searchInput = filtersForm.elements.q;
const app = document.querySelector("#catalog-app");
let debounceTimer = 0;
let activeController = null;
let requestVersion = 0;

function readWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem(wishlistStorageKey) ?? "[]");
    if (!Array.isArray(saved)) return [];

    const validBooks = saved.filter((book) => (
      book
      && typeof book.id === "string"
      && typeof book.key === "string"
      && typeof book.title === "string"
      && typeof book.authors === "string"
    ));
    return [...new Map(validBooks.map((book) => [book.id, {
      id: book.id,
      key: book.key,
      title: book.title,
      authors: book.authors,
      year: Number.isInteger(book.year) ? book.year : null,
      coverId: Number.isInteger(book.coverId) ? book.coverId : null,
      editionCount: Number.isInteger(book.editionCount) ? book.editionCount : null,
      rating: typeof book.rating === "number" ? book.rating : null,
    }])).values()];
  } catch {
    return [];
  }
}

function saveWishlist() {
  try {
    localStorage.setItem(wishlistStorageKey, JSON.stringify(state.wishlist));
  } catch {
    // Wishlist remains available until this page closes if browser storage is blocked.
  }
}

function errorMessage(error) {
  if (error instanceof ApiError && error.status >= 500) {
    return `Open Library временно недоступна (ошибка ${error.status}). Попробуйте ещё раз.`;
  }
  if (error instanceof ApiError && error.status >= 400) {
    return `Open Library отклонила запрос (ошибка ${error.status}). Проверьте запрос и повторите попытку.`;
  }
  if (!navigator.onLine || error instanceof TypeError) {
    return "Нет соединения с Open Library. Проверьте сеть и повторите попытку.";
  }
  return "Не удалось загрузить книги. Повторите попытку.";
}

const state = {
  status: "empty",
  message: "Введите минимум два символа для поиска.",
  query: "",
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
  results: [],
  wishlist: readWishlist(),
};

function scheduleSearch(query, page = 1, delay = 350) {
  window.clearTimeout(debounceTimer);
  activeController?.abort();
  activeController = null;
  const version = ++requestVersion;
  state.query = query;
  state.page = page;
  state.results = [];
  state.total = 0;
  state.totalPages = 0;

  if (query.trim().length < 2) {
    state.status = "empty";
    state.message = "Введите минимум два символа для поиска.";
    renderCatalog(state);
    return;
  }

  state.status = "loading";
  state.message = "Ищем книги в Open Library…";
  renderCatalog(state);
  debounceTimer = window.setTimeout(() => loadPage(query.trim(), page, version), delay);
}

async function loadPage(query, page, version) {
  const controller = new AbortController();
  activeController = controller;

  try {
    const response = await searchBooks(query, page, controller.signal);
    if (version !== requestVersion) return;

    state.results = response.books;
    state.total = response.total;
    state.totalPages = Math.ceil(response.total / state.pageSize);
    state.status = response.books.length > 0 ? "success" : "empty";
    state.message = response.books.length > 0
      ? `Загрузка завершена. Найдено ${response.total} книг.`
      : "По этому запросу книги не найдены.";
  } catch (error) {
    if (error?.name === "AbortError" || version !== requestVersion) return;
    state.status = "error";
    state.message = errorMessage(error);
  } finally {
    if (version === requestVersion) {
      renderCatalog(state);
    }
    if (activeController === controller) {
      activeController = null;
    }
  }
}

filtersForm.addEventListener("submit", (event) => {
  event.preventDefault();
  scheduleSearch(searchInput.value, 1, 0);
});

filtersForm.addEventListener("input", (event) => {
  if (event.target === searchInput) {
    scheduleSearch(searchInput.value, 1);
  }
});

app.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton || !app.contains(actionButton)) return;

  const { action, bookId } = actionButton.dataset;
  if (action === "clear-search") {
    searchInput.value = "";
    scheduleSearch("", 1);
    searchInput.focus();
    return;
  }
  if (action === "retry-search") {
    scheduleSearch(state.query, state.page, 0);
    return;
  }
  if (action === "previous-page" && state.page > 1) {
    scheduleSearch(state.query, state.page - 1, 0);
    return;
  }
  if (action === "next-page" && state.page < state.totalPages) {
    scheduleSearch(state.query, state.page + 1, 0);
    return;
  }

  if (action === "toggle-wishlist") {
    const book = state.results.find((result) => result.id === bookId);
    if (!book) return;
    state.wishlist = state.wishlist.some((entry) => entry.id === bookId)
      ? state.wishlist.filter((entry) => entry.id !== bookId)
      : [...state.wishlist, book];
    saveWishlist();
    renderCatalog(state);
  }

  if (action === "remove-wishlist") {
    state.wishlist = state.wishlist.filter((book) => book.id !== bookId);
    saveWishlist();
    renderCatalog(state);
  }
});

renderCatalog(state);
