import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../app/contexts/AuthContext";
import { Button } from "../shared/components/Button";

interface LoginLocationState {
  from?: { pathname?: string };
}

export function LoginPage() {
  const { user, loginDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LoginLocationState | null;
  const destination = state?.from?.pathname ?? "/books";

  function signIn(): void {
    loginDemo();
    navigate(destination, { replace: true });
  }

  return (
    <section className="page-stack" aria-labelledby="login-heading">
      <h1 className="page-title" id="login-heading">Вход читателя</h1>
      <p>Для лабораторной работы доступна демонстрационная заглушка авторизации.</p>
      {user && <p role="status">Вы вошли как {user.name}.</p>}
      <Button onClick={signIn}>Войти в демо-режиме</Button>
    </section>
  );
}
