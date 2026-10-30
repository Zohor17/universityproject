export interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="catalog-empty" aria-live="polite">
      <h3>{title}</h3>
      <p>{description}</p>
    </section>
  );
}
