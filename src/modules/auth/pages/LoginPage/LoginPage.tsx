import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import { useLoader } from 'modules/shared/hooks/useLoader';
import { login, clearError } from 'modules/auth/store/authSlice';
import { ROUTES } from 'modules/shared/constants/routes';
import './LoginPage.scss';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { withLoader } = useLoader();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await withLoader(() => dispatch(login({ email, password })).unwrap());
    if (result) navigate(ROUTES.PROPERTIES);
  };

  return (
    <div className="login-page">
      <div className="login-page__card">
        <div className="login-page__header">
          <div className="login-page__logo">
            <img src="/logo-alaria.svg" alt="Alaria" style={{ height: '80px' }} />
          </div>
          <h2 className="login-page__title">Iniciar Sesión</h2>
          <p className="login-page__subtitle">Ingresa tus credenciales para acceder</p>
        </div>

        <form className="login-page__form" onSubmit={handleSubmit}>
          <div className="login-page__field">
            <label className="login-page__label" htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              className="login-page__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className="login-page__field">
            <label className="login-page__label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              className="login-page__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              required
            />
          </div>

          {error && <div className="login-page__error">{error}</div>}

          <button className="login-page__submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="login-page__footer">
          ¿No tienes cuenta?{' '}
          <Link to={ROUTES.REGISTER} className="login-page__link">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
