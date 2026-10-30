import { useEffect, useState } from "react";
import { ApiError } from "../../api/client";
import type { ApiFailure, LoadStatus } from "../types";

export type Fetcher<T> = (signal: AbortSignal) => Promise<T>;

export interface FetchState<T> {
  status: LoadStatus;
  data: T | null;
  error: ApiFailure | null;
}

function toFailure(error: unknown): ApiFailure {
  if (error instanceof ApiError && error.status !== undefined) {
    return {
      message: error.message,
      status: error.status,
      kind: error.status >= 500 ? "server" : "client",
    };
  }
  if (error instanceof ApiError) return { message: error.message, kind: "network" };
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
