import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { createEditorBook, EditorApiError, getEditorBook, updateEditorBook } from "../api/editorBooks";
import { bookSchema } from "../shared/validation/bookSchema";
import type { BookFormValues } from "../shared/validation/bookSchema";
import { Button } from "../shared/components/Button";

const EMPTY_BOOK: BookFormValues = {
  title: "",
  author: "",
  genre: "fiction",
  firstPublishedYear: 2000,
  lastEditionYear: 2000,
  pageCount: 200,
  description: "",
};

export function BookFormPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [loadError, setLoadError] = useState("");
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: EMPTY_BOOK,
    mode: "onBlur",
  });

  useEffect(() => {
    setLoadError("");
    if (!bookId) {
      reset(EMPTY_BOOK);
      return;
    }
    const saved = getEditorBook(bookId);
    if (!saved) {
      setLoadError("Книга для редактирования не найдена.");
      return;
    }
    reset({
      title: saved.title,
      author: saved.author,
      genre: saved.genre,
      firstPublishedYear: saved.firstPublishedYear,
      lastEditionYear: saved.lastEditionYear,
      pageCount: saved.pageCount,
      description: saved.description,
    });
  }, [bookId, reset]);

  async function submit(values: BookFormValues): Promise<void> {
    try {
      const saved = bookId
        ? await updateEditorBook(bookId, values)
        : await createEditorBook(values);
      navigate(`/books/${saved.id}`);
    } catch (error) {
      if (error instanceof EditorApiError && error.status === 422) {
        for (const field of ["title", "author", "genre", "firstPublishedYear", "lastEditionYear", "pageCount", "description"] as const) {
          const message = error.fieldErrors[field];
          if (message) setError(field, { type: "server", message });
        }
        setError("root.server", { type: "server", message: error.message });
      } else if (error instanceof EditorApiError && error.status === 409) {
        setError("title", { type: "server", message: error.fieldErrors.title ?? "Книга с таким названием уже существует." });
        setError("root.server", { type: "server", message: error.message });
      } else {
        const message = error instanceof Error ? error.message : "Не удалось сохранить книгу.";
        setError("root.server", { type: "server", message });
      }
    }
  }

  const editing = bookId !== undefined;
  if (loadError) {
    return <section className="page-stack"><h1 className="page-title">Книга не найдена</h1><p role="alert">{loadError}</p><Link to="/books">Вернуться в каталог</Link></section>;
  }

  return (
    <section className="page-stack" aria-labelledby="book-form-heading">
      <h1 className="page-title" id="book-form-heading">{editing ? "Редактировать книгу" : "Добавить книгу"}</h1>
      <p>Поля проверяются схемой Zod. Год переиздания должен быть не раньше первой публикации.</p>
      <form className="editor-form" noValidate onSubmit={handleSubmit(submit)}>
        <p className="form-field">
          <label className="field-label" htmlFor="title">Название</label>
          <input className="form-control" id="title" {...register("title")} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "title-error" : undefined} />
          {errors.title?.message && <span className="field-error" id="title-error" role="alert">{errors.title.message}</span>}
        </p>
        <p className="form-field">
          <label className="field-label" htmlFor="author">Автор</label>
          <input className="form-control" id="author" {...register("author")} aria-invalid={Boolean(errors.author)} aria-describedby={errors.author ? "author-error" : undefined} />
          {errors.author?.message && <span className="field-error" id="author-error" role="alert">{errors.author.message}</span>}
        </p>
        <p className="form-field">
          <label className="field-label" htmlFor="genre">Жанр</label>
          <select className="form-control" id="genre" {...register("genre")} aria-invalid={Boolean(errors.genre)} aria-describedby={errors.genre ? "genre-error" : undefined}>
            <option value="fiction">Художественная литература</option><option value="fantasy">Фэнтези</option><option value="history">История</option><option value="science">Наука</option><option value="poetry">Поэзия</option><option value="other">Другое</option>
          </select>
          {errors.genre?.message && <span className="field-error" id="genre-error" role="alert">{errors.genre.message}</span>}
        </p>
        <p className="form-field">
          <label className="field-label" htmlFor="firstPublishedYear">Год первой публикации</label>
          <input className="form-control" id="firstPublishedYear" type="number" {...register("firstPublishedYear", { valueAsNumber: true })} aria-invalid={Boolean(errors.firstPublishedYear)} aria-describedby={errors.firstPublishedYear ? "first-year-error" : undefined} />
          {errors.firstPublishedYear?.message && <span className="field-error" id="first-year-error" role="alert">{errors.firstPublishedYear.message}</span>}
        </p>
        <p className="form-field">
          <label className="field-label" htmlFor="lastEditionYear">Год последнего переиздания</label>
          <input className="form-control" id="lastEditionYear" type="number" {...register("lastEditionYear", { valueAsNumber: true })} aria-invalid={Boolean(errors.lastEditionYear)} aria-describedby={errors.lastEditionYear ? "last-year-error" : undefined} />
          {errors.lastEditionYear?.message && <span className="field-error" id="last-year-error" role="alert">{errors.lastEditionYear.message}</span>}
        </p>
        <p className="form-field">
          <label className="field-label" htmlFor="pageCount">Количество страниц</label>
          <input className="form-control" id="pageCount" type="number" {...register("pageCount", { valueAsNumber: true })} aria-invalid={Boolean(errors.pageCount)} aria-describedby={errors.pageCount ? "pages-error" : undefined} />
          {errors.pageCount?.message && <span className="field-error" id="pages-error" role="alert">{errors.pageCount.message}</span>}
        </p>
        <p className="form-field">
          <label className="field-label" htmlFor="description">Описание</label>
          <textarea className="form-control" id="description" {...register("description")} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "description-error" : undefined} />
          {errors.description?.message && <span className="field-error" id="description-error" role="alert">{errors.description.message}</span>}
        </p>
        {errors.root?.server?.message && <p className="form-error" role="alert">{errors.root.server.message}</p>}
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Сохраняем…" : "Сохранить книгу"}</Button>
      </form>
    </section>
  );
}
