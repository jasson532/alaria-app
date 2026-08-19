import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import { useLoader } from 'modules/shared/hooks/useLoader';
import { createProperty, updateProperty, fetchPropertyById } from 'modules/properties/store/propertiesSlice';
import { supabase } from 'modules/shared/services/supabase';
import { ROUTES } from 'modules/shared/constants/routes';
import MediaManager from 'modules/properties/components/organisms/MediaManager/MediaManager';
import LocationPicker from 'modules/properties/components/organisms/LocationPicker/LocationPicker';
import type { CatalogEntity, StratumEntity } from 'modules/shared/types';
import type { PropertyFormData } from 'modules/properties/types';
import './PropertyFormPage.scss';

const defaultForm: PropertyFormData = {
  title: '',
  description: '',
  address: '',
  neighborhood: '',
  locality_id: '',
  stratum_id: '',
  property_type_id: '',
  transaction_type_id: '',
  state_id: '',
  price: 0,
  admin_fee: 0,
  area_m2: 0,
  bedrooms: 1,
  bathrooms: 1,
  parking_spaces: 0,
  floor_number: null,
  has_balcony: false,
  has_elevator: false,
  has_gym: false,
  has_pool: false,
  has_security: false,
  year_built: null,
  latitude: null,
  longitude: null,
};

const PropertyFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { selectedProperty } = useAppSelector((state) => state.properties);
  const { withLoader } = useLoader();

  const [formData, setFormData] = useState<PropertyFormData>(defaultForm);
  const [localities, setLocalities] = useState<CatalogEntity[]>([]);
  const [strata, setStrata] = useState<StratumEntity[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<CatalogEntity[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<CatalogEntity[]>([]);
  const [propertyStates, setPropertyStates] = useState<CatalogEntity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCatalogs();
    if (isEdit && id) dispatch(fetchPropertyById(id));
  }, [id, isEdit, dispatch]);

  useEffect(() => {
    if (isEdit && selectedProperty) {
      setFormData({
        title: selectedProperty.title,
        description: selectedProperty.description || '',
        address: selectedProperty.address,
        neighborhood: selectedProperty.neighborhood || '',
        locality_id: selectedProperty.locality_id,
        stratum_id: selectedProperty.stratum_id,
        property_type_id: selectedProperty.property_type_id,
        transaction_type_id: selectedProperty.transaction_type_id,
        state_id: selectedProperty.state_id,
        price: selectedProperty.price,
        admin_fee: selectedProperty.admin_fee,
        area_m2: selectedProperty.area_m2,
        bedrooms: selectedProperty.bedrooms,
        bathrooms: selectedProperty.bathrooms,
        parking_spaces: selectedProperty.parking_spaces,
        floor_number: selectedProperty.floor_number,
        has_balcony: selectedProperty.has_balcony,
        has_elevator: selectedProperty.has_elevator,
        has_gym: selectedProperty.has_gym,
        has_pool: selectedProperty.has_pool,
        has_security: selectedProperty.has_security,
        year_built: selectedProperty.year_built,
        latitude: selectedProperty.latitude,
        longitude: selectedProperty.longitude,
      });
    }
  }, [isEdit, selectedProperty]);

  const loadCatalogs = async () => {
    const [locRes, strRes, ptRes, ttRes, psRes] = await Promise.all([
      supabase.from('house_localities').select('*').order('name'),
      supabase.from('house_strata').select('*').order('level'),
      supabase.from('house_property_types').select('*').order('name'),
      supabase.from('house_transaction_types').select('*').order('name'),
      supabase.from('house_property_states').select('*').order('name'),
    ]);
    if (locRes.data) setLocalities(locRes.data);
    if (strRes.data) setStrata(strRes.data);
    if (ptRes.data) setPropertyTypes(ptRes.data);
    if (ttRes.data) setTransactionTypes(ttRes.data);
    if (psRes.data) setPropertyStates(psRes.data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: value === '' ? null : Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await withLoader(async () => {
        if (isEdit && id) {
          await dispatch(updateProperty({ id, data: formData })).unwrap();
          navigate(`/inmuebles/${id}`);
        } else {
          if (!user?.id) throw new Error('Sesión no válida');
          await dispatch(createProperty({ data: formData, createdBy: user.id })).unwrap();
          navigate(ROUTES.PROPERTIES);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="property-form-page">
      <h1 className="property-form-page__title">
        {isEdit ? 'Editar Inmueble' : ''}
      </h1>

      {error && <div className="property-form-page__error">{error}</div>}
      {success && <div className="property-form-page__success">{success}</div>}

      <form className="property-form-page__form" onSubmit={handleSubmit}>
        {/* Información básica */}
        <div className="property-form-page__section">
          <h3 className="property-form-page__section-title">Información Básica</h3>
          <div className="property-form-page__grid">
            <div className="property-form-page__field property-form-page__field--full">
              <label className="property-form-page__label">Título *</label>
              <input className="property-form-page__input" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="property-form-page__field property-form-page__field--full">
              <label className="property-form-page__label">Descripción</label>
              <textarea className="property-form-page__textarea" name="description" value={formData.description} onChange={handleChange} />
            </div>
            <div className="property-form-page__field">
              <label className="property-form-page__label">Tipo de inmueble *</label>
              <select className="property-form-page__select" name="property_type_id" value={formData.property_type_id} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {propertyTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="property-form-page__field">
              <label className="property-form-page__label">Tipo de negocio *</label>
              <select className="property-form-page__select" name="transaction_type_id" value={formData.transaction_type_id} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {transactionTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="property-form-page__field">
              <label className="property-form-page__label">Estado *</label>
              <select className="property-form-page__select" name="state_id" value={formData.state_id} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {propertyStates.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="property-form-page__section">
          <h3 className="property-form-page__section-title">Ubicación</h3>
          <div className="property-form-page__grid">
            <div className="property-form-page__field property-form-page__field--full">
              <label className="property-form-page__label">Dirección *</label>
              <input className="property-form-page__input" name="address" value={formData.address} onChange={handleChange} required />
            </div>
            <div className="property-form-page__field">
              <label className="property-form-page__label">Barrio</label>
              <input className="property-form-page__input" name="neighborhood" value={formData.neighborhood} onChange={handleChange} />
            </div>
            <div className="property-form-page__field">
              <label className="property-form-page__label">Localidad *</label>
              <select className="property-form-page__select" name="locality_id" value={formData.locality_id} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {localities.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="property-form-page__field">
              <label className="property-form-page__label">Estrato *</label>
              <select className="property-form-page__select" name="stratum_id" value={formData.stratum_id} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {strata.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="property-form-page__field property-form-page__field--full">
              <label className="property-form-page__label">Ubicación en el mapa</label>
              <LocationPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
              />
            </div>
          </div>
        </div>

        {/* Precio y detalles */}
        <div className="property-form-page__section">
          <h3 className="property-form-page__section-title">Precio y Características</h3>
          <div className="property-form-page__grid">
            <div className="property-form-page__field">
              <label className="property-form-page__label">Precio (COP) *</label>
              <input className="property-form-page__input" type="number" name="price" value={formData.price || ''} onChange={handleChange} required />
            </div>
            <div className="property-form-page__field">
              <label className="property-form-page__label">Administración (COP/mes)</label>
              <input className="property-form-page__input" type="number" name="admin_fee" value={formData.admin_fee || ''} onChange={handleChange} />
            </div>
            <div className="property-form-page__field">
              <label className="property-form-page__label">Área (m²) *</label>
              <input className="property-form-page__input" type="number" name="area_m2" value={formData.area_m2 || ''} onChange={handleChange} required />
            </div>
            <div className="property-form-page__field">
              <label className="property-form-page__label">Habitaciones *</label>
              <input className="property-form-page__input" type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} min={0} required />
            </div>
            <div className="property-form-page__field">
              <label className="property-form-page__label">Baños *</label>
              <input className="property-form-page__input" type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} min={0} required />
            </div>
            <div className="property-form-page__field">
              <label className="property-form-page__label">Parqueaderos</label>
              <input className="property-form-page__input" type="number" name="parking_spaces" value={formData.parking_spaces} onChange={handleChange} min={0} />
            </div>
            <div className="property-form-page__field">
              <label className="property-form-page__label">Piso</label>
              <input className="property-form-page__input" type="number" name="floor_number" value={formData.floor_number ?? ''} onChange={handleChange} />
            </div>
            <div className="property-form-page__field">
              <label className="property-form-page__label">Año construcción</label>
              <input className="property-form-page__input" type="number" name="year_built" value={formData.year_built ?? ''} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Amenidades */}
        <div className="property-form-page__section">
          <h3 className="property-form-page__section-title">Amenidades</h3>
          <div className="property-form-page__checkbox-group">
            <label className="property-form-page__checkbox">
              <input type="checkbox" name="has_balcony" checked={formData.has_balcony} onChange={handleChange} />
              Balcón
            </label>
            <label className="property-form-page__checkbox">
              <input type="checkbox" name="has_elevator" checked={formData.has_elevator} onChange={handleChange} />
              Ascensor
            </label>
            <label className="property-form-page__checkbox">
              <input type="checkbox" name="has_gym" checked={formData.has_gym} onChange={handleChange} />
              Gimnasio
            </label>
            <label className="property-form-page__checkbox">
              <input type="checkbox" name="has_pool" checked={formData.has_pool} onChange={handleChange} />
              Piscina
            </label>
            <label className="property-form-page__checkbox">
              <input type="checkbox" name="has_security" checked={formData.has_security} onChange={handleChange} />
              Seguridad 24h
            </label>
          </div>
        </div>

        {/* Fotos y Videos */}
        {isEdit && id && (
          <div className="property-form-page__section">
            <h3 className="property-form-page__section-title">Fotos y Videos</h3>
            <MediaManager
              propertyId={id}
              media={selectedProperty?.house_property_media || []}
              onUpdate={() => dispatch(fetchPropertyById(id))}
            />
          </div>
        )}

        {/* Acciones */}
        <div className="property-form-page__actions">
          <button type="button" className="property-form-page__btn property-form-page__btn--secondary" onClick={() => navigate(isEdit && id ? `/inmuebles/${id}` : ROUTES.PROPERTIES)}>
            Cancelar
          </button>
          <button type="submit" className="property-form-page__btn property-form-page__btn--primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyFormPage;
