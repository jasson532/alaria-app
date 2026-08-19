import { useNavigate } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Car, ImageOff, UserCheck } from 'lucide-react';
import { useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import type { PropertyWithRelations } from 'modules/properties/types';
import './PropertyCard.scss';

interface PropertyCardProps {
  property: PropertyWithRelations;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const PropertyCard = ({ property }: PropertyCardProps) => {
  const navigate = useNavigate();
  const { role } = useAppSelector((state) => state.auth);

  const coverImage = property.house_property_media?.find((m) => m.is_cover)
    || property.house_property_media?.[0];

  const transactionType = property.house_transaction_types?.name?.toLowerCase();
  const badgeClass = transactionType === 'venta' ? 'property-card__badge--sale' : 'property-card__badge--rent';

  return (
    <article
      className="property-card"
      onClick={() => navigate(`/inmuebles/${property.id}`)}
    >
      <div className="property-card__image-container">
        {coverImage ? (
          <img
            className="property-card__image"
            src={coverImage.file_url}
            alt={property.title}
            loading="lazy"
          />
        ) : (
          <div className="property-card__no-image">
            <ImageOff size={48} />
          </div>
        )}
        <span className={`property-card__badge ${badgeClass}`}>
          {property.house_transaction_types?.name}
        </span>
      </div>

      <div className="property-card__content">
        <h3 className="property-card__title">{property.title}</h3>
        <div className="property-card__location">
          <MapPin size={14} />
          <span>{property.house_localities?.name} - Estrato {property.house_strata?.level}</span>
        </div>
        <p className="property-card__price">{formatPrice(property.price)}</p>
        <div className="property-card__features">
          <span className="property-card__feature">
            <BedDouble size={16} />
            {property.bedrooms}
          </span>
          <span className="property-card__feature">
            <Bath size={16} />
            {property.bathrooms}
          </span>
          <span className="property-card__feature">
            <Car size={16} />
            {property.parking_spaces}
          </span>
          <span className="property-card__feature">
            {property.area_m2} m²
          </span>
        </div>
        {role === 'admin' && property.house_users?.full_name && (
          <div className="property-card__admin-tag">
            <UserCheck size={12} />
            {property.house_users.full_name.split(' ')[0]}
          </div>
        )}
      </div>
    </article>
  );
};

export default PropertyCard;
