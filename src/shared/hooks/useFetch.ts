import { useEffect, useState } from "react";
import type { ApiFailure, LoadStatus } from "../types";

export type Fetcher<T> = (signal: AbortSignal) => Promise<T>;

export interface FetchState<T> {
  status: LoadStatus;
  data: T | null;
  error: ApiFailure | null;
}

function toFailure(error: unknown): ApiFailure {
  const apiError = error instanceof Error && "status" in error
    ? error as Error & { status?: unknown }
    : null;
  if (apiError && typeof apiError.status === "number") {
    return {
      message: apiError.message,
      status: apiError.status,
      kind: apiError.status >= 500 ? "server" : "client",
    };
  }
  if (apiError) return { message: apiError.message, kind: "network" };
  return { message: "Не удалось загрузить данные. Повторите попытку.", kind: "unknown" };
}

export function useFetch<T>(fetcher: Fetcher<T>, enabled: boolean, requestKey: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ status: "empty", data: null, error: null });

  useEffect(() => {
    if (!enabled) {
      setState({ status: "empty", data: null, error: null });
      return undefined;
    }

    const controller = new AbortController();
    setState({ status: "loading", data: null, error: null });

    async function load(): Promise<void> {
      try {
        const data = await fetcher(controller.signal);
        if (!controller.signal.aborted) setState({ status: "success", data, error: null });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setState({ status: "error", data: null, error: toFailure(error) });
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [fetcher, enabled, requestKey]);

  return state;
}
