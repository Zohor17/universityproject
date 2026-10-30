import { books, genres } from "./data/books.js";
import { getVisibleBooks, getWishlistBooks } from "./lib/books.js";
import { render } from "./ui/render.js";

const storageKey = "booknest.preferences.v1";
const knownBookIds = new Set(books.map((book) => book.id));
const knownGenres = new Set(["all", ...genres.map((genre) => genre.id)]);
const knownSorts = new Set(["title", "year", "rating"]);
const filtersForm = document.querySelector(".filters-form");
const app = document.querySelector("#catalog-app");

function defaultFilters() {
  return { query: "", genre: "all", availableOnly: false, sortBy: "title" };
}

function loadPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (saved === null || typeof saved !== "object") {
      return { filters: defaultFilters(), wishlist: [] };
    }

    const savedFilters = saved.filters && typeof saved.filters === "object" ? saved.filters : {};
    const query = typeof savedFilters.query === "string" ? savedFilters.query.slice(0, 80) : "";
    const genre = knownGenres.has(savedFilters.genre) ? savedFilters.genre : "all";
    const sortBy = knownSorts.has(savedFilters.sortBy) ? savedFilters.sortBy : "title";
    const availableOnly = savedFilters.availableOnly === true;
    const wishlist = Array.isArray(saved.wishlist)
      ? [...new Set(saved.wishlist.filter((id) => typeof id === "string" && knownBookIds.has(id)))]
      : [];

    return { filters: { query, genre, availableOnly, sortBy }, wishlist };
  } catch {
    return { filters: defaultFilters(), wishlist: [] };
  }
}

function savePreferences() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ filters: state.filters, wishlist: state.wishlist }));
  } catch {
    // Storage may be unavailable in a private or restricted browser context.
  }
}

function updateDerivedData() {
  state.visibleBooks = getVisibleBooks(state.books, state.filters);
  state.wishlistBooks = getWishlistBooks(state.books, state.wishlist);
}

const preferences = loadPreferences();
const state = {
  books,
  genres,
  filters: preferences.filters,
  wishlist: preferences.wishlist,
  visibleBooks: [],
  wishlistBooks: [],
};

function syncFilterControls() {
  filtersForm.elements.q.value = state.filters.query;
  filtersForm.elements.genre.value = state.filters.genre;
  filtersForm.elements.sort.value = state.filters.sortBy;
  filtersForm.elements.available.checked = state.filters.availableOnly;
}

function applyStateChanges() {
  updateDerivedData();
  savePreferences();
  render(state);
}

filtersForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

filtersForm.addEventListener("input", (event) => {
  const control = event.target;
  if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) {
    return;
  }

  if (control.name === "q") state.filters.query = control.value;
  if (control.name === "genre") state.filters.genre = control.value;
  if (control.name === "sort") state.filters.sortBy = control.value;
  if (control.name === "available") state.filters.availableOnly = control.checked;

  applyStateChanges();
});

app.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton || !app.contains(actionButton)) {
    return;
  }

  const { action, bookId } = actionButton.dataset;
  if (action === "reset-filters") {
    filtersForm.reset();
    state.filters = defaultFilters();
    syncFilterControls();
    applyStateChanges();
    return;
  }

  if (!knownBookIds.has(bookId)) {
    return;
  }

  if (action === "toggle-wishlist") {
    state.wishlist = state.wishlist.includes(bookId)
      ? state.wishlist.filter((id) => id !== bookId)
      : [...state.wishlist, bookId];
    applyStateChanges();
  }

  if (action === "remove-wishlist") {
    state.wishlist = state.wishlist.filter((id) => id !== bookId);
    applyStateChanges();
  }
});

syncFilterControls();
updateDerivedData();
render(state);
