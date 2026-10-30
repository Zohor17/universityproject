const API_BASE_URL = "https://openlibrary.org";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function getJson(path, { params, signal } = {}) {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    for (const [key, value] of params) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new ApiError(`Open Library вернула ${response.status}.`, response.status);
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError("Сервер вернул некорректный JSON.", 502);
  }
}
