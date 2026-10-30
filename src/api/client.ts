const API_BASE_URL = "https://openlibrary.org";

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(new URL(path, API_BASE_URL), {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("Не удалось связаться с Open Library.");
  }

  if (!response.ok) {
    throw new ApiError(`Open Library вернула ошибку ${response.status}.`, response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError("Сервер вернул некорректный JSON.", 502);
  }
}
