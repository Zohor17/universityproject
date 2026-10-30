import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AppLayout } from "./AppLayout";
import { RequireAuth } from "./components/RequireAuth";
import { BookFormPage } from "../pages/BookFormPage";
import { BookDetailsPage } from "../pages/BookDetailsPage";
import { BooksPage } from "../pages/BooksPage";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { WishlistPage } from "../pages/WishlistPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/books" replace />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/new" element={<BookFormPage />} />
          <Route path="/books/:bookId/edit" element={<BookFormPage />} />
          <Route path="/books/:bookId" element={<BookDetailsPage />} />
          <Route path="/wishlist" element={<RequireAuth><WishlistPage /></RequireAuth>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
