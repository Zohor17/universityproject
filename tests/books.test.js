import assert from "node:assert/strict";
import test from "node:test";
import { filterBooks, getVisibleBooks, getWishlistBooks, sortBooks } from "../lib/books.js";

const sampleBooks = [
  { id: "b", title: "Зелёный дом", author: "Анна Лесная", year: 2020, genre: "fiction", rating: 4.4, available: true },
  { id: "a", title: "Белая ночь", author: "Иван Морозов", year: 2024, genre: "detective", rating: 4.9, available: false },
  { id: "c", title: "Синяя река", author: "Анна Лесная", year: 2022, genre: "fiction", rating: 4.8, available: false },
];

test("search matches title and author without case sensitivity", () => {
  assert.deepEqual(
    filterBooks(sampleBooks, { query: "ЛЕСНАЯ", genre: "all", availableOnly: false }),
    [sampleBooks[0], sampleBooks[2]],
  );
  assert.deepEqual(
    filterBooks(sampleBooks, { query: "БЕЛАЯ", genre: "all", availableOnly: false }),
    [sampleBooks[1]],
  );
});

test("genre and availability filters combine", () => {
  assert.deepEqual(
    filterBooks(sampleBooks, { query: "", genre: "fiction", availableOnly: true }),
    [sampleBooks[0]],
  );
});

test("sorting returns a new array for title, year, and rating orders", () => {
  const originalOrder = sampleBooks.map((book) => book.id);
  assert.deepEqual(sortBooks(sampleBooks, "title").map((book) => book.id), ["a", "b", "c"]);
  assert.deepEqual(sortBooks(sampleBooks, "year").map((book) => book.id), ["a", "c", "b"]);
  assert.deepEqual(sortBooks(sampleBooks, "rating").map((book) => book.id), ["a", "c", "b"]);
  assert.deepEqual(sampleBooks.map((book) => book.id), originalOrder);
});

test("combined selection and wishlist preserve the source collection", () => {
  const source = [...sampleBooks];
  const visible = getVisibleBooks(source, { query: "", genre: "all", availableOnly: false, sortBy: "rating" });
  assert.deepEqual(visible.map((book) => book.id), ["a", "c", "b"]);
  assert.deepEqual(getWishlistBooks(source, ["b", "a"]), [sampleBooks[0], sampleBooks[1]]);
  assert.deepEqual(source, sampleBooks);
});
