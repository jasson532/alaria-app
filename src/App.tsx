import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from 'modules/shared/store';
import { ROUTES } from 'modules/shared/constants/routes';
import MainLayout from 'modules/shared/components/templates/MainLayout/MainLayout';
import GlobalLoader from 'modules/shared/components/atoms/GlobalLoader/GlobalLoader';
import ProtectedRoute from 'modules/auth/components/organisms/ProtectedRoute/ProtectedRoute';
import LoginPage from 'modules/auth/pages/LoginPage/LoginPage';
import RegisterPage from 'modules/auth/pages/RegisterPage/RegisterPage';
import DashboardPage from 'modules/dashboard/pages/DashboardPage/DashboardPage';
import PropertiesListPage from 'modules/properties/pages/PropertiesListPage/PropertiesListPage';
import PropertyDetailPage from 'modules/properties/pages/PropertyDetailPage/PropertyDetailPage';
import PropertyFormPage from 'modules/properties/pages/PropertyFormPage/PropertyFormPage';
import FavoritesPage from 'modules/properties/pages/FavoritesPage/FavoritesPage';
import AppointmentsPage from 'modules/appointments/pages/AppointmentsPage/AppointmentsPage';
import CatalogsPage from 'modules/catalogs/pages/CatalogsPage/CatalogsPage';
import ProfilePage from 'modules/auth/pages/ProfilePage/ProfilePage';
import AppInitializer from 'modules/shared/components/organisms/AppInitializer/AppInitializer';

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <GlobalLoader />
        <AppInitializer>
          <Routes>
            {/* Auth */}
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

            {/* Todas las rutas con MainLayout (header + sidebar hamburguesa) */}
            <Route element={<MainLayout />}>
              {/* Públicas */}
              <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.PROPERTIES} replace />} />
              <Route path={ROUTES.PROPERTIES} element={<PropertiesListPage />} />
              <Route path={ROUTES.PROPERTY_DETAIL} element={<PropertyDetailPage />} />

              {/* Protegidas - cualquier usuario autenticado */}
              <Route path={ROUTES.APPOINTMENTS} element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
              <Route path={ROUTES.FAVORITES} element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
              <Route path={ROUTES.PROFILE} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Admin */}
              <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute requiredRole="admin"><DashboardPage /></ProtectedRoute>} />
              <Route path={ROUTES.PROPERTY_CREATE} element={<ProtectedRoute requiredRole="admin"><PropertyFormPage /></ProtectedRoute>} />
              <Route path={ROUTES.PROPERTY_EDIT} element={<ProtectedRoute requiredRole="admin"><PropertyFormPage /></ProtectedRoute>} />
              <Route path={ROUTES.CATALOGS} element={<ProtectedRoute requiredRole="admin"><CatalogsPage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </AppInitializer>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
