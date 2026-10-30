import { ApiError } from "./client";
import type { BookFormValues } from "../shared/validation/bookSchema";

export interface EditorBook extends BookFormValues {
  id: string;
}

type BookField = keyof BookFormValues;
type FieldErrors = Partial<Record<BookField, string>>;

export class EditorApiError extends ApiError {
  constructor(message: string, status: number, readonly fieldErrors: FieldErrors = {}) {
    super(message, status);
    this.name = "EditorApiError";
  }
}

const STORAGE_KEY = "booknest.editor-books.v1";

function readBooks(): EditorBook[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(saved)) return [];
    const entries: unknown[] = saved;
    return entries.filter(isEditorBook);
  } catch {
    return [];
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEditorBook(value: unknown): value is EditorBook {
  if (!isRecord(value)) return false;
  const genres = ["fiction", "fantasy", "history", "science", "poetry", "other"];
  return typeof value.id === "string"
    && typeof value.title === "string"
    && typeof value.author === "string"
    && typeof value.genre === "string"
    && genres.includes(value.genre)
    && typeof value.firstPublishedYear === "number"
    && typeof value.lastEditionYear === "number"
    && typeof value.pageCount === "number"
    && typeof value.description === "string";
}

function saveBooks(books: EditorBook[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function validateMockResponse(values: BookFormValues, books: EditorBook[], excludeId?: string): void {
  if (values.author.toLocaleLowerCase() === "server error 422") {
    throw new EditorApiError("Сервер вернул ошибки полей.", 422, { author: "Этот автор отклонён тестовой заглушкой." });
  }
  if (values.author.toLocaleLowerCase() === "server error 500") {
    throw new EditorApiError("Тестовая заглушка вернула внутреннюю ошибку.", 500);
  }
  const duplicate = books.some((book) => book.id !== excludeId && book.title.toLocaleLowerCase() === values.title.toLocaleLowerCase());
  if (duplicate) {
    throw new EditorApiError("Книга с таким названием уже существует.", 409, { title: "Название уже занято." });
  }
}

export function listEditorBooks(): EditorBook[] {
  return readBooks();
}

export function getEditorBook(bookId: string): EditorBook | null {
  return readBooks().find((book) => book.id === bookId) ?? null;
}

export async function createEditorBook(values: BookFormValues): Promise<EditorBook> {
  const books = readBooks();
  validateMockResponse(values, books);
  const created = { ...values, id: `local-${crypto.randomUUID()}` };
  saveBooks([...books, created]);
  return created;
}

export async function updateEditorBook(bookId: string, values: BookFormValues): Promise<EditorBook> {
  const books = readBooks();
  if (!books.some((book) => book.id === bookId)) {
    throw new EditorApiError("Книга для редактирования не найдена.", 404);
  }
  validateMockResponse(values, books, bookId);
  const updated = { ...values, id: bookId };
  saveBooks(books.map((book) => book.id === bookId ? updated : book));
  return updated;
}
