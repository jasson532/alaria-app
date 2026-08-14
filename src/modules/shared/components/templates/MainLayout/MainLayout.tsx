import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from 'modules/shared/components/organisms/Sidebar/Sidebar';
import { useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import { ROUTES } from 'modules/shared/constants/routes';
import './MainLayout.scss';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="main-layout">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Top bar */}
      <header className="main-layout__topbar">
        <button
          className="main-layout__menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Menú"
          title="Menú"
        >
          <Menu size={22} />
          <span className="main-layout__menu-label">Menú</span>
        </button>

        <Link
          to={ROUTES.PROPERTIES}
          className={`main-layout__logo ${scrolled ? 'main-layout__logo--compact' : ''}`}
        >
          <img src="/logo-alaria.svg" alt="Alaria" className="main-layout__logo-img" />
        </Link>

        {isAuthenticated && user && (
          <span className="main-layout__user-name">Hola {user.full_name.split(' ')[0]}!</span>
        )}
      </header>

      <main className="main-layout__content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
