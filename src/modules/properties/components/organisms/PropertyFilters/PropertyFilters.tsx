import { useState, useEffect } from 'react';
import { supabase } from 'modules/shared/services/supabase';
import type { CatalogEntity, StratumEntity } from 'modules/shared/types';
import type { PropertyFilters as FiltersType } from 'modules/properties/types';
import './PropertyFilters.scss';

interface PropertyFiltersProps {
  onApply: (filters: FiltersType) => void;
}

const PropertyFilters = ({ onApply }: PropertyFiltersProps) => {
  const [transactionTypes, setTransactionTypes] = useState<CatalogEntity[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<CatalogEntity[]>([]);
  const [localities, setLocalities] = useState<CatalogEntity[]>([]);
  const [strata, setStrata] = useState<StratumEntity[]>([]);

  const [filters, setFilters] = useState<FiltersType>({});

  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    const [ttRes, ptRes, locRes, strRes] = await Promise.all([
      supabase.from('house_transaction_types').select('*').order('name'),
      supabase.from('house_property_types').select('*').order('name'),
      supabase.from('house_localities').select('*').order('name'),
      supabase.from('house_strata').select('*').order('level'),
    ]);
    if (ttRes.data) setTransactionTypes(ttRes.data);
    if (ptRes.data) setPropertyTypes(ptRes.data);
    if (locRes.data) setLocalities(locRes.data);
    if (strRes.data) setStrata(strRes.data);
  };

  const handleChange = (key: keyof FiltersType, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const handleApply = () => {
    onApply(filters);
  };

  const handleClear = () => {
    setFilters({});
    onApply({});
  };

  return (
    <aside className="property-filters">
      <h3 className="property-filters__title">Filtros</h3>

      <div className="property-filters__group">
        <label className="property-filters__label">Tipo de negocio</label>
        <select
          className="property-filters__select"
          value={filters.transaction_type_id || ''}
          onChange={(e) => handleChange('transaction_type_id', e.target.value)}
        >
          <option value="">Todos</option>
          {transactionTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="property-filters__group">
        <label className="property-filters__label">Tipo de inmueble</label>
        <select
          className="property-filters__select"
          value={filters.property_type_id || ''}
          onChange={(e) => handleChange('property_type_id', e.target.value)}
        >
          <option value="">Todos</option>
          {propertyTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="property-filters__group">
        <label className="property-filters__label">Localidad</label>
        <select
          className="property-filters__select"
          value={filters.locality_id || ''}
          onChange={(e) => handleChange('locality_id', e.target.value)}
        >
          <option value="">Todas</option>
          {localities.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      <div className="property-filters__group">
        <label className="property-filters__label">Estrato</label>
        <select
          className="property-filters__select"
          value={filters.stratum_id || ''}
          onChange={(e) => handleChange('stratum_id', e.target.value)}
        >
          <option value="">Todos</option>
          {strata.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="property-filters__group">
        <label className="property-filters__label">Rango de precio</label>
        <div className="property-filters__row">
          <input
            className="property-filters__input"
            type="number"
            placeholder="Mínimo"
            value={filters.min_price || ''}
            onChange={(e) => handleChange('min_price', e.target.value)}
          />
          <input
            className="property-filters__input"
            type="number"
            placeholder="Máximo"
            value={filters.max_price || ''}
            onChange={(e) => handleChange('max_price', e.target.value)}
          />
        </div>
      </div>

      <div className="property-filters__group">
        <label className="property-filters__label">Habitaciones mínimas</label>
        <select
          className="property-filters__select"
          value={filters.bedrooms || ''}
          onChange={(e) => handleChange('bedrooms', e.target.value)}
        >
          <option value="">Cualquiera</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>

      <div className="property-filters__actions">
        <button className="property-filters__btn property-filters__btn--primary" onClick={handleApply}>
          Buscar
        </button>
        <button className="property-filters__btn property-filters__btn--secondary" onClick={handleClear}>
          Limpiar
        </button>
      </div>
    </aside>
  );
};

export default PropertyFilters;
