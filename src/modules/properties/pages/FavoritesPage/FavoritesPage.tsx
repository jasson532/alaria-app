import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import { supabase } from 'modules/shared/services/supabase';
import PropertyCard from 'modules/properties/components/molecules/PropertyCard/PropertyCard';
import type { PropertyWithRelations } from 'modules/properties/types';
import './FavoritesPage.scss';

const PROPERTY_SELECT = `
  *,
  house_localities(name),
  house_strata(level, name),
  house_property_types(name),
  house_transaction_types(name),
  house_property_states(name),
  house_property_media(*)
`;

const FavoritesPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [favorites, setFavorites] = useState<PropertyWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadFavorites();
  }, [user?.id]);

  const loadFavorites = async () => {
    setIsLoading(true);
    const { data: favData } = await supabase
      .from('house_favorites')
      .select('property_id')
      .eq('user_id', user!.id);

    if (!favData || favData.length === 0) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    const propertyIds = favData.map((f) => f.property_id);
    const { data } = await supabase
      .from('house_properties')
      .select(PROPERTY_SELECT)
      .in('id', propertyIds);

    setFavorites(data || []);
    setIsLoading(false);
  };

  return (
    <div className="favorites-page">
      <h1 className="favorites-page__title">Mis Favoritos</h1>
      <p className="favorites-page__subtitle">Inmuebles que has guardado</p>

      {isLoading ? (
        <p className="favorites-page__loading">Cargando...</p>
      ) : favorites.length === 0 ? (
        <div className="favorites-page__empty">
          <Heart size={48} />
          <p>No tienes inmuebles guardados</p>
          <span>Explora el listado y guarda los que te interesen</span>
        </div>
      ) : (
        <div className="favorites-page__grid">
          {favorites.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
