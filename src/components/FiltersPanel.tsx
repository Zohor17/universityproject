import type { ChangeEvent } from "react";
import type { SortOrder } from "../types";
import { Button } from "./Button";

export interface FiltersPanelProps {
  query: string;
  genre: string;
  sort: SortOrder;
  availableOnly: boolean;
  onQueryChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onSortChange: (value: SortOrder) => void;
  onAvailableChange: (value: boolean) => void;
  onSearch: () => void;
}

export function FiltersPanel(props: FiltersPanelProps) {
  function updateSort(event: ChangeEvent<HTMLSelectElement>): void {
    props.onSortChange(event.currentTarget.value as SortOrder);
  }

  return (
    <section className="catalog-filters" aria-labelledby="filters-heading">
      <h2 className="section-heading" id="filters-heading">Найти книгу</h2>
      <form className="filters-form" onSubmit={(event) => { event.preventDefault(); props.onSearch(); }}>
        <p className="form-field">
          <label className="field-label" htmlFor="search">Название книги или имя автора</label>
          <input
            className="form-control"
            id="search"
            name="q"
            type="search"
            minLength={2}
            maxLength={80}
            value={props.query}
            onChange={(event) => props.onQueryChange(event.currentTarget.value)}
            aria-describedby="search-hint"
          />
        </p>
        <p className="form-help" id="search-hint">Введите минимум два символа. Результаты обновятся после короткой паузы.</p>
        <p className="form-field">
          <label className="field-label" htmlFor="genre">Жанр</label>
          <select className="form-control" id="genre" name="genre" value={props.genre} onChange={(event) => props.onGenreChange(event.currentTarget.value)}>
            <option value="all">Все жанры</option>
            <option value="fiction">Художественная литература</option>
            <option value="fantasy">Фэнтези</option>
            <option value="history">История</option>
            <option value="science">Наука</option>
            <option value="poetry">Поэзия</option>
          </select>
        </p>
        <p className="form-field">
          <label className="field-label" htmlFor="sort">Сортировка</label>
          <select className="form-control" id="sort" name="sort" value={props.sort} onChange={updateSort}>
            <option value="relevance">По релевантности</option>
            <option value="title">По названию</option>
            <option value="year">По году</option>
            <option value="rating">По рейтингу</option>
          </select>
        </p>
        <p className="form-field form-field--inline">
          <input className="checkbox-input" id="available" name="available" type="checkbox" checked={props.availableOnly} onChange={(event) => props.onAvailableChange(event.currentTarget.checked)} />
          <label className="field-label" htmlFor="available">Только с полным текстом</label>
        </p>
        <Button type="submit">Найти</Button>
      </form>
    </section>
  );
}
