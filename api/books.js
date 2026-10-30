import { getJson } from "./client.js";

const SEARCH_FIELDS = [
  "key",
  "title",
  "author_name",
  "first_publish_year",
  "cover_i",
  "edition_count",
  "ratings_average",
].join(",");

export function normalizeSearchResponse(payload) {
  const docs = Array.isArray(payload.docs) ? payload.docs : [];
  const total = Number(payload.numFound ?? payload.num_found ?? 0);

  return {
    total: Number.isFinite(total) ? total : 0,
    books: docs.flatMap((doc) => {
      if (typeof doc.key !== "string" || typeof doc.title !== "string") {
        return [];
      }

      return [{
        id: doc.key.split("/").filter(Boolean).at(-1),
        key: doc.key,
        title: doc.title,
        authors: Array.isArray(doc.author_name) ? doc.author_name.join(", ") : "Автор не указан",
        year: Number.isInteger(doc.first_publish_year) ? doc.first_publish_year : null,
        coverId: Number.isInteger(doc.cover_i) ? doc.cover_i : null,
        editionCount: Number.isInteger(doc.edition_count) ? doc.edition_count : null,
        rating: typeof doc.ratings_average === "number" ? doc.ratings_average : null,
      }];
    }),
  };
}

export async function searchBooks(query, page, signal) {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    limit: "20",
    fields: SEARCH_FIELDS,
  });
  const payload = await getJson("/search.json", { params, signal });
  return normalizeSearchResponse(payload);
}

function normalizeDescription(description) {
  if (typeof description === "string") return description;
  if (description && typeof description.value === "string") return description.value;
  return "Для этой книги пока нет описания.";
}

export async function getBookDetails(workId, signal) {
  const safeId = encodeURIComponent(workId.replace(/^\/works\//, "").replace(/\.json$/, ""));
  const workPath = `/works/${safeId}`;
  const [work, ratings] = await Promise.all([
    getJson(`${workPath}.json`, { signal }),
    getJson(`${workPath}/ratings.json`, { signal }),
  ]);

  const authorIds = Array.isArray(work.authors)
    ? work.authors.flatMap((entry) => {
      const key = entry?.author?.key;
      return typeof key === "string" ? [key.split("/").filter(Boolean).at(-1)] : [];
    })
    : [];

  return {
    id: safeId,
    title: typeof work.title === "string" ? work.title : "Без названия",
    description: normalizeDescription(work.description),
    authors: authorIds,
    subjects: Array.isArray(work.subjects) ? work.subjects.slice(0, 8) : [],
    rating: typeof ratings.summary?.average === "number" ? ratings.summary.average : null,
    ratingCount: Number.isInteger(ratings.summary?.count) ? ratings.summary.count : 0,
  };
}
