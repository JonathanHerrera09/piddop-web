import { FormEvent, useState } from 'react';
import { loginWithEmail } from '@/services/auth.service';
import { ApiError } from '@/services/http';
import { ThemeMode } from '@/services/theme.service';
import { WebSession } from '@/types/auth';

function AuthThemeIcon({ mode }: { mode: ThemeMode }) {
  return mode === 'dark'
    ? <svg aria-hidden="true" className="ui-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" /></svg>
    : <svg aria-hidden="true" className="ui-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" /></svg>;
}

function PasswordIcon({ visible }: { visible: boolean }) {
  return visible
    ? <svg aria-hidden="true" className="ui-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></svg>
    : <svg aria-hidden="true" className="ui-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="m3 3 18 18M10.6 6.2A10.5 10.5 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3 3.7M6.3 6.3C3.5 8.2 2 12 2 12s3.5 6 10 6c1.2 0 2.3-.2 3.3-.6" /></svg>;
}

interface AuthScreenProps {
  onAuthenticated: (session: WebSession) => void;
  onThemeToggle: () => void;
  themeMode: ThemeMode;
}

export function AuthScreen({ onAuthenticated, onThemeToggle, themeMode }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Completa correo y contrasena para continuar.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const session = await loginWithEmail(email, password);
      onAuthenticated(session);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('No pudimos iniciar sesion en este momento.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div className="auth-hero__topbar">
          <div className="auth-hero__eyebrow"><img src="/piddop-icon.png" alt="" /> <span>Piddop</span></div>
          <button className="theme-toggle" onClick={onThemeToggle} type="button">
            <span aria-hidden="true"><AuthThemeIcon mode={themeMode} /></span>
            <strong>Pasar a {themeMode === 'dark' ? 'claro' : 'oscuro'}</strong>
          </button>
        </div>
        <h1 className="auth-hero__title"><span className="auth-desktop-copy">Opera tu negocio con una vista clara, rapida y elegante.</span><span className="auth-mobile-copy">Bienvenido<br />de nuevo</span></h1>
        <p className="auth-hero__copy">
          <span className="auth-desktop-copy">Gestiona pedidos, productos, servicios, citas y equipo desde un panel pensado para el trabajo diario.</span><span className="auth-mobile-copy">Gestiona tu negocio desde un solo lugar.</span>
        </p>
      </section>

      <section className="auth-card-wrap">
        <div className="auth-card">
          <div className="auth-card__brand">
            <img className="auth-card__logo" src="/piddop-icon.png" alt="Piddop" />
            <div>
              <p className="auth-card__label">Bienvenido</p>
              <h2>Iniciar sesion</h2>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Correo electronico</span>
              <input
                autoComplete="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@piddop.com"
                type="email"
                value={email}
              />
            </label>

            <label className="field auth-password-field">
              <span>Contrasena</span>
              <span className="auth-password-field__control">
                <input
                  autoComplete="current-password"
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Escribe tu contrasena"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                />
                <button className="auth-password-field__toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'} title={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}>
                  <PasswordIcon visible={showPassword} />
                </button>
              </span>
            </label>

            {errorMessage ? <p className="form-error" role="alert">{errorMessage}</p> : null}

            <button className="primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Entrando...' : 'Entrar al panel'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
