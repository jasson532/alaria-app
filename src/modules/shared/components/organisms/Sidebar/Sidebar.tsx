import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Calendar, BookOpen, Heart, User, LogOut, LayoutDashboard, X, PlusCircle, LogIn } from 'lucide-react';
import { useAppDispatch, useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import { logout } from 'modules/auth/store/authSlice';
import { ROUTES } from 'modules/shared/constants/routes';
import { version } from '../../../../../../package.json';
import './Sidebar.scss';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, role, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate(ROUTES.PROPERTIES);
    onClose();
  };

  const handleNavClick = () => {
    onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <img src="/logo-alaria.svg" alt="Alaria" className="sidebar__logo-img" />
        </div>
        <button className="sidebar__close-btn" onClick={onClose} aria-label="Cerrar menú" title="Cerrar menú">
          <X size={22} />
        </button>
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {/* Siempre visible */}
          <li>
            <NavLink to={ROUTES.PROPERTIES} className="sidebar__link" onClick={handleNavClick} title="Ver inmuebles disponibles">
              <Home size={20} />
              <span>Inmuebles</span>
            </NavLink>
          </li>

          {/* Sin sesión: solo Ingresar */}
          {!isAuthenticated && (
            <>
              <li className="sidebar__divider" />
              <li>
                <NavLink to={ROUTES.LOGIN} className="sidebar__link sidebar__link--highlight" onClick={handleNavClick} title="Iniciar sesión">
                  <LogIn size={20} />
                  <span>Ingresar</span>
                </NavLink>
              </li>
            </>
          )}

          {/* Con sesión: opciones según rol */}
          {isAuthenticated && role === 'admin' && (
            <>
              <li className="sidebar__divider" />
              <li className="sidebar__section-label">Administración</li>
              <li>
                <NavLink to={ROUTES.DASHBOARD} className="sidebar__link" onClick={handleNavClick} title="Panel de control">
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink to={ROUTES.PROPERTY_CREATE} className="sidebar__link" onClick={handleNavClick} title="Registrar nuevo inmueble">
                  <PlusCircle size={20} />
                  <span>Registrar Inmueble</span>
                </NavLink>
              </li>
              <li>
                <NavLink to={ROUTES.APPOINTMENTS} className="sidebar__link" onClick={handleNavClick} title="Gestionar citas y crear agendas">
                  <Calendar size={20} />
                  <span>Citas y Agendas</span>
                </NavLink>
              </li>
              <li>
                <NavLink to={ROUTES.CATALOGS} className="sidebar__link" onClick={handleNavClick} title="Administrar catálogos del sistema">
                  <BookOpen size={20} />
                  <span>Catálogos</span>
                </NavLink>
              </li>
            </>
          )}

          {isAuthenticated && role === 'user' && (
            <>
              <li className="sidebar__divider" />
              <li className="sidebar__section-label">Mi cuenta</li>
              <li>
                <NavLink to={ROUTES.FAVORITES} className="sidebar__link" onClick={handleNavClick} title="Inmuebles guardados">
                  <Heart size={20} />
                  <span>Mis Favoritos</span>
                </NavLink>
              </li>
              <li>
                <NavLink to={ROUTES.APPOINTMENTS} className="sidebar__link" onClick={handleNavClick} title="Visitas que has agendado">
                  <Calendar size={20} />
                  <span>Mis Citas</span>
                </NavLink>
              </li>
            </>
          )}

          {isAuthenticated && (
            <>
              <li className="sidebar__divider" />
              <li>
                <NavLink to={ROUTES.PROFILE} className="sidebar__link" onClick={handleNavClick} title="Ver tu perfil">
                  <User size={20} />
                  <span>Mi Perfil</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      {isAuthenticated && (
        <div className="sidebar__footer">
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{user?.full_name}</span>
            <span className="sidebar__user-role">{role === 'admin' ? 'Administrador' : 'Usuario'}</span>
          </div>
          <button className="sidebar__logout" onClick={handleLogout} aria-label="Cerrar sesión" title="Cerrar sesión">
            <LogOut size={18} />
            <span className="sidebar__logout-label">Salir</span>
          </button>
        </div>
      )}

      <div className="sidebar__version">v{version}</div>
    </aside>
  );
};

export default Sidebar;
