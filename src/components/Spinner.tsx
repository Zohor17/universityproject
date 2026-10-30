export interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = "Загрузка…" }: SpinnerProps) {
  return <p className="api-state api-state--loading" role="status" aria-live="polite">{label}</p>;
}
