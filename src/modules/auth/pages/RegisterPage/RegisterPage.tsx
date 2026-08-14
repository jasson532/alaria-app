import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import { register, clearError } from 'modules/auth/store/authSlice';
import { ROUTES } from 'modules/shared/constants/routes';
import { supabase } from 'modules/shared/services/supabase';
import type { CatalogEntity, StratumEntity } from 'modules/shared/types';
import './RegisterPage.scss';

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    address: '',
    locality_id: '',
    stratum_id: '',
  });

  const [localities, setLocalities] = useState<CatalogEntity[]>([]);
  const [strata, setStrata] = useState<StratumEntity[]>([]);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    const [localitiesRes, strataRes] = await Promise.all([
      supabase.from('house_localities').select('*').order('name'),
      supabase.from('house_strata').select('*').order('level'),
    ]);
    if (localitiesRes.data) setLocalities(localitiesRes.data);
    if (strataRes.data) setStrata(strataRes.data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearError());

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const result = await dispatch(register({
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      locality_id: formData.locality_id || undefined,
      stratum_id: formData.stratum_id || undefined,
    }));

    if (register.fulfilled.match(result)) {
      navigate(ROUTES.PROPERTIES);
    }
  };

  return (
    <div className="register-page">
      <div className="register-page__card">
        <div className="register-page__header">
          <div className="register-page__logo">
            <img src="/logo-alaria.svg" alt="Alaria" style={{ height: '80px' }} />
          </div>
          <h2 className="register-page__title">Crear Cuenta</h2>
          <p className="register-page__subtitle">Regístrate para acceder a todos los inmuebles</p>
        </div>

        <form className="register-page__form" onSubmit={handleSubmit}>
          <div className="register-page__field">
            <label className="register-page__label" htmlFor="full_name">Nombre completo *</label>
            <input
              id="full_name"
              name="full_name"
              className="register-page__input"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div className="register-page__field">
            <label className="register-page__label" htmlFor="email">Correo electrónico *</label>
            <input
              id="email"
              name="email"
              className="register-page__input"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className="register-page__row">
            <div className="register-page__field">
              <label className="register-page__label" htmlFor="password">Contraseña *</label>
              <input
                id="password"
                name="password"
                className="register-page__input"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div className="register-page__field">
              <label className="register-page__label" htmlFor="confirmPassword">Confirmar *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                className="register-page__input"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repetir contraseña"
                required
              />
            </div>
          </div>

          <div className="register-page__field">
            <label className="register-page__label" htmlFor="phone">Teléfono</label>
            <input
              id="phone"
              name="phone"
              className="register-page__input"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="300 123 4567"
            />
          </div>

          <div className="register-page__field">
            <label className="register-page__label" htmlFor="address">Dirección</label>
            <input
              id="address"
              name="address"
              className="register-page__input"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="Tu dirección actual"
            />
          </div>

          <div className="register-page__row">
            <div className="register-page__field">
              <label className="register-page__label" htmlFor="locality_id">Localidad</label>
              <select
                id="locality_id"
                name="locality_id"
                className="register-page__input"
                value={formData.locality_id}
                onChange={handleChange}
              >
                <option value="">Seleccionar...</option>
                {localities.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div className="register-page__field">
              <label className="register-page__label" htmlFor="stratum_id">Estrato</label>
              <select
                id="stratum_id"
                name="stratum_id"
                className="register-page__input"
                value={formData.stratum_id}
                onChange={handleChange}
              >
                <option value="">Seleccionar...</option>
                {strata.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {(error || localError) && (
            <div className="register-page__error">{localError || error}</div>
          )}

          <button className="register-page__submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="register-page__footer">
          ¿Ya tienes cuenta?{' '}
          <Link to={ROUTES.LOGIN} className="register-page__link">
            Inicia sesión
          </Link>
        </div>
        <button className="register-page__cancel" type="button" onClick={() => navigate(ROUTES.PROPERTIES)}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
