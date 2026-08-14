import { useEffect, useState } from 'react';
import { Building2, LayoutGrid, Map, SlidersHorizontal, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import { fetchProperties, setFilters } from 'modules/properties/store/propertiesSlice';
import PropertyCard from 'modules/properties/components/molecules/PropertyCard/PropertyCard';
import PropertyFilters from 'modules/properties/components/organisms/PropertyFilters/PropertyFilters';
import PropertiesMap from 'modules/properties/components/organisms/PropertiesMap/PropertiesMap';
import type { PropertyFilters as FiltersType } from 'modules/properties/types';
import './PropertiesListPage.scss';

type ViewMode = 'grid' | 'map';

const PropertiesListPage = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading, filters } = useAppSelector((state) => state.properties);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProperties(filters));
  }, [dispatch, filters]);

  const handleApplyFilters = (newFilters: FiltersType) => {
    dispatch(setFilters(newFilters));
    setFiltersOpen(false);
  };

  return (
    <div className="properties-list-page">
      <div className="properties-list-page__header">
        <div>
          <h1 className="properties-list-page__title">Alaria</h1>
          <p className="properties-list-page__subtitle">
            Tu próximo hogar te está esperando
          </p>
        </div>
        <div className="properties-list-page__actions">
          <button
            className="properties-list-page__filter-toggle"
            onClick={() => setFiltersOpen(!filtersOpen)}
            aria-label="Filtros"
          >
            {filtersOpen ? <X size={20} /> : <SlidersHorizontal size={20} />}
            <span>Filtros</span>
          </button>
          <div className="properties-list-page__view-toggle">
            <button
              className={`properties-list-page__view-btn ${viewMode === 'grid' ? 'properties-list-page__view-btn--active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Vista en cuadrícula"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              className={`properties-list-page__view-btn ${viewMode === 'map' ? 'properties-list-page__view-btn--active' : ''}`}
              onClick={() => setViewMode('map')}
              aria-label="Vista en mapa"
            >
              <Map size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="properties-list-page__layout">
        <div className={`properties-list-page__filters ${filtersOpen ? 'properties-list-page__filters--open' : ''}`}>
          <PropertyFilters onApply={handleApplyFilters} />
        </div>

        {viewMode === 'grid' ? (
          <div className="properties-list-page__grid">
            {isLoading ? (
              <div className="properties-list-page__loading">Cargando inmuebles...</div>
            ) : items.length === 0 ? (
              <div className="properties-list-page__empty">
                <Building2 size={64} className="properties-list-page__empty-icon" />
                <p className="properties-list-page__empty-text">No se encontraron inmuebles</p>
                <p className="properties-list-page__empty-sub">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              items.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </div>
        ) : (
          <div className="properties-list-page__map-container">
            {isLoading ? (
              <p className="properties-list-page__loading">Cargando mapa...</p>
            ) : (
              <PropertiesMap properties={items} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesListPage;
