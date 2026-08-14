import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import { fetchCatalog, setActiveTable } from 'modules/catalogs/store/catalogsSlice';
import { CATALOG_CONFIGS } from 'modules/catalogs/types';
import CatalogTable from 'modules/catalogs/components/organisms/CatalogTable/CatalogTable';
import ContactsTable from 'modules/catalogs/components/organisms/ContactsTable/ContactsTable';
import './CatalogsPage.scss';

const CatalogsPage = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((state) => state.catalogs);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeConfig = CATALOG_CONFIGS[activeIndex];
  const isContacts = activeConfig.key === 'contacts';

  useEffect(() => {
    if (!isContacts) {
      dispatch(setActiveTable(activeConfig.table));
      dispatch(fetchCatalog(activeConfig.table));
    }
  }, [activeIndex, activeConfig.table, isContacts, dispatch]);

  return (
    <div className="catalogs-page">
      <h1 className="catalogs-page__title">Catálogos</h1>
      <p className="catalogs-page__subtitle">Administra los datos maestros del sistema</p>

      <div className="catalogs-page__tabs">
        {CATALOG_CONFIGS.map((config, index) => (
          <button
            key={config.key}
            className={`catalogs-page__tab ${index === activeIndex ? 'catalogs-page__tab--active' : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            {config.label}
          </button>
        ))}
      </div>

      {isContacts ? (
        <ContactsTable />
      ) : isLoading ? (
        <p style={{ padding: '2rem', color: '#6b7280' }}>Cargando...</p>
      ) : (
        <CatalogTable
          title={activeConfig.label}
          table={activeConfig.table}
          items={items}
        />
      )}
    </div>
  );
};

export default CatalogsPage;
