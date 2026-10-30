export type LoadStatus = "idle" | "loading" | "success" | "empty" | "error";
export type SortOrder = "relevance" | "title" | "year" | "rating";

export interface BookSummary {
  id: string;
  key: string;
  title: string;
  authors: string;
  year: number | null;
  coverId: number | null;
  editionCount: number | null;
  rating: number | null;
  subjects: string[];
  hasFullText: boolean;
}

export interface BookDetails {
  id: string;
  title: string;
  description: string;
  authors: string[];
  subjects: string[];
  rating: number | null;
  ratingCount: number;
}

export interface SearchResponse {
  total: number;
  books: BookSummary[];
}

export interface ApiFailure {
  message: string;
  status?: number;
  kind: "network" | "client" | "server" | "unknown";
}
