import { Button } from "./Button";

export interface PaginationProps {
  page: number;
  totalPages: number;
  disabled: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, disabled, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Страницы каталога">
      <Button variant="secondary" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>Назад</Button>
      <span className="pagination__status" aria-live="polite">Страница {page} из {totalPages}</span>
      <Button variant="secondary" disabled={disabled || page >= totalPages} onClick={() => onPageChange(page + 1)}>Дальше</Button>
    </nav>
  );
}
