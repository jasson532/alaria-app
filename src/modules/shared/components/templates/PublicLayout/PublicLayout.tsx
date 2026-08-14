import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import { logout } from 'modules/auth/store/authSlice';
import AlariaLogo from 'modules/shared/components/atoms/AlariLogo/AlariaLogo';
import { ROUTES } from 'modules/shared/constants/routes';
import './PublicLayout.scss';

const PublicLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate(ROUTES.PROPERTIES);
  };

  return (
    <div className="public-layout">
      <header className="public-layout__header">
        <Link to={ROUTES.HOME} className="public-layout__logo">
          <AlariaLogo size={28} color="#ffffff" />
          <span>Alaria</span>
        </Link>

        <nav className={`public-layout__nav ${mobileMenuOpen ? 'public-layout__nav--open' : ''}`}>
          <Link to={ROUTES.PROPERTIES} className="public-layout__nav-link" onClick={() => setMobileMenuOpen(false)}>
            Inmuebles
          </Link>

          {isAuthenticated ? (
            <>
              <span className="public-layout__user-name">{user?.full_name}</span>
              <button className="public-layout__btn public-layout__btn--logout" onClick={handleLogout} title="Cerrar sesión">
                <LogOut size={18} />
                <span className="public-layout__btn-label">Salir</span>
              </button>
            </>
          ) : (
            <Link to={ROUTES.LOGIN} className="public-layout__btn public-layout__btn--primary" onClick={() => setMobileMenuOpen(false)}>
              <LogIn size={18} />
              Ingresar
            </Link>
          )}
        </nav>

        <button
          className="public-layout__hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menú"
          title="Menú"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>
      <main className="public-layout__content">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
