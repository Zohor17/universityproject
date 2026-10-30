import { getJson } from "./client";
import type { BookDetails, BookSummary, SearchResponse } from "../shared/types";

interface SearchDocument {
  key?: unknown;
  title?: unknown;
  author_name?: unknown;
  first_publish_year?: unknown;
  cover_i?: unknown;
  edition_count?: unknown;
  ratings_average?: unknown;
  subject?: unknown;
  has_fulltext?: unknown;
  ebook_access?: unknown;
}

interface SearchPayload {
  numFound?: unknown;
  num_found?: unknown;
  docs?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeDocument(value: unknown): BookSummary | null {
  if (!isRecord(value)) return null;
  const doc = value as SearchDocument;
  if (typeof doc.key !== "string" || typeof doc.title !== "string") return null;
  const id = doc.key.split("/").filter(Boolean).at(-1);
  if (!id) return null;

  const authors = Array.isArray(doc.author_name)
    ? doc.author_name.filter((name): name is string => typeof name === "string").join(", ")
    : "Автор не указан";
  const subjects = Array.isArray(doc.subject)
    ? doc.subject.filter((subject): subject is string => typeof subject === "string")
    : [];

  return {
    id,
    key: doc.key,
    title: doc.title,
    authors,
    year: Number.isInteger(doc.first_publish_year) ? doc.first_publish_year as number : null,
    coverId: Number.isInteger(doc.cover_i) ? doc.cover_i as number : null,
    editionCount: Number.isInteger(doc.edition_count) ? doc.edition_count as number : null,
    rating: typeof doc.ratings_average === "number" ? doc.ratings_average : null,
    subjects,
    hasFullText: doc.has_fulltext === true || doc.ebook_access === "full_access",
  };
}

export function normalizeSearchResponse(payload: SearchPayload): SearchResponse {
  const docs = Array.isArray(payload.docs) ? payload.docs : [];
  const total = Number(payload.numFound ?? payload.num_found ?? 0);
  return {
    total: Number.isFinite(total) ? total : 0,
    books: docs.map(normalizeDocument).filter((book): book is BookSummary => book !== null),
  };
}

export async function searchBooks(query: string, page: number, signal: AbortSignal): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    limit: "20",
    fields: "key,title,author_name,first_publish_year,cover_i,edition_count,ratings_average,subject,has_fulltext,ebook_access",
  });
  const payload = await getJson<SearchPayload>(`/search.json?${params.toString()}`, signal);
  return normalizeSearchResponse(payload);
}

interface WorkPayload {
  title?: unknown;
  description?: unknown;
  authors?: unknown;
  subjects?: unknown;
}

interface RatingsPayload {
  summary?: { average?: unknown; count?: unknown };
}

function getDescription(value: unknown): string {
  if (typeof value === "string") return value;
  if (isRecord(value) && typeof value.value === "string") return value.value;
  return "Для этой книги пока нет описания.";
}

export async function getBookDetails(workId: string, signal: AbortSignal): Promise<BookDetails> {
  const safeId = encodeURIComponent(workId.replace(/^\/works\//, "").replace(/\.json$/, ""));
  const path = `/works/${safeId}`;
  const [work, ratings] = await Promise.all([
    getJson<WorkPayload>(`${path}.json`, signal),
    getJson<RatingsPayload>(`${path}/ratings.json`, signal),
  ]);
  const authors = Array.isArray(work.authors)
    ? work.authors.flatMap((entry) => {
      if (!isRecord(entry) || !isRecord(entry.author) || typeof entry.author.key !== "string") return [];
      return [entry.author.key.split("/").filter(Boolean).at(-1) ?? ""];
    }).filter(Boolean)
    : [];
  const subjects = Array.isArray(work.subjects)
    ? work.subjects.filter((subject): subject is string => typeof subject === "string").slice(0, 8)
    : [];

  return {
    id: safeId,
    title: typeof work.title === "string" ? work.title : "Без названия",
    description: getDescription(work.description),
    authors,
    subjects,
    rating: typeof ratings.summary?.average === "number" ? ratings.summary.average : null,
    ratingCount: Number.isInteger(ratings.summary?.count) ? ratings.summary.count as number : 0,
  };
}
