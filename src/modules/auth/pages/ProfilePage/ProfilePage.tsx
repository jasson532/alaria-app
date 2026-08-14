import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import { useLoader } from 'modules/shared/hooks/useLoader';
import { supabase } from 'modules/shared/services/supabase';
import type { CatalogEntity, StratumEntity } from 'modules/shared/types';
import './ProfilePage.scss';

const ProfilePage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { withLoader } = useLoader();

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    locality_id: '',
    stratum_id: '',
  });
  const [localities, setLocalities] = useState<CatalogEntity[]>([]);
  const [strata, setStrata] = useState<StratumEntity[]>([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadCatalogs();
    if (user) {
      setForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || '',
        locality_id: user.locality_id || '',
        stratum_id: user.stratum_id || '',
      });
    }
  }, [user]);

  const loadCatalogs = async () => {
    const [locRes, strRes] = await Promise.all([
      supabase.from('house_localities').select('*').order('name'),
      supabase.from('house_strata').select('*').order('level'),
    ]);
    if (locRes.data) setLocalities(locRes.data);
    if (strRes.data) setStrata(strRes.data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!form.full_name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    await withLoader(async () => {
      const { error: updateError } = await supabase
        .from('house_users')
        .update({
          full_name: form.full_name.trim(),
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          locality_id: form.locality_id || null,
          stratum_id: form.stratum_id || null,
        })
        .eq('id', user!.id);

      if (updateError) {
        setError('Error al actualizar: ' + updateError.message);
      } else {
        setSuccess('Perfil actualizado correctamente');
        // Actualizar localStorage
        const stored = localStorage.getItem('house_user_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem('house_user_session', JSON.stringify({
            ...parsed,
            full_name: form.full_name.trim(),
            phone: form.phone.trim() || null,
            address: form.address.trim() || null,
            locality_id: form.locality_id || null,
            stratum_id: form.stratum_id || null,
          }));
        }
      }
    });
  };

  return (
    <div className="profile-page">
      <p className="profile-page__subtitle">Actualiza tu información personal</p>

      <form className="profile-page__form" onSubmit={handleSubmit}>
        <div className="profile-page__field">
          <label className="profile-page__label">Correo electrónico</label>
          <input className="profile-page__input profile-page__input--disabled" type="email" value={user?.email || ''} disabled />
        </div>

        <div className="profile-page__field">
          <label className="profile-page__label">Nombre completo *</label>
          <input className="profile-page__input" type="text" name="full_name" value={form.full_name} onChange={handleChange} required />
        </div>

        <div className="profile-page__field">
          <label className="profile-page__label">Teléfono</label>
          <input className="profile-page__input" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="300 123 4567" />
        </div>

        <div className="profile-page__field">
          <label className="profile-page__label">Dirección</label>
          <input className="profile-page__input" type="text" name="address" value={form.address} onChange={handleChange} placeholder="Tu dirección" />
        </div>

        <div className="profile-page__row">
          <div className="profile-page__field">
            <label className="profile-page__label">Localidad</label>
            <select className="profile-page__input" name="locality_id" value={form.locality_id} onChange={handleChange}>
              <option value="">Seleccionar...</option>
              {localities.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
          <div className="profile-page__field">
            <label className="profile-page__label">Estrato</label>
            <select className="profile-page__input" name="stratum_id" value={form.stratum_id} onChange={handleChange}>
              <option value="">Seleccionar...</option>
              {strata.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="profile-page__error">{error}</div>}
        {success && <div className="profile-page__success">{success}</div>}

        <button type="submit" className="profile-page__submit">
          Guardar cambios
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
