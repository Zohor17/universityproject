import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <section className="page-stack" aria-labelledby="not-found-heading">
      <h1 className="page-title" id="not-found-heading">404 — страница не найдена</h1>
      <p>Проверьте адрес или вернитесь в каталог.</p>
      <Link className="button-link" to="/books">Открыть каталог</Link>
    </section>
  );
}
