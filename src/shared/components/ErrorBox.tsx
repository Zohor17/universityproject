import type { ApiFailure } from "../types";
import { Button } from "./Button";

export interface ErrorBoxProps {
  error: ApiFailure;
  onRetry: () => void;
}

export function ErrorBox({ error, onRetry }: ErrorBoxProps) {
  const heading = error.kind === "network"
    ? "Нет соединения"
    : error.kind === "server"
      ? "Ошибка сервера"
      : error.kind === "client"
        ? "Сервер отклонил запрос"
        : "Не удалось загрузить данные";

  return (
    <section className="api-state api-state--error" role="alert">
      <h3>{heading}</h3>
      <p>{error.message}</p>
      <Button variant="secondary" onClick={onRetry}>Повторить</Button>
    </section>
  );
}
