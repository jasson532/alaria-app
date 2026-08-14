import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { PropertyWithRelations } from 'modules/properties/types';
import './PropertiesMap.scss';

// Fix Leaflet default icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = defaultIcon;

const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: '<div style="width:18px;height:18px;background:#2563eb;border:3px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(37,99,235,0.5);"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface PropertiesMapProps {
  properties: PropertyWithRelations[];
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatPriceShort = (price: number): string => {
  if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)}B`;
  if (price >= 1000000) return `${Math.round(price / 1000000)}M`;
  if (price >= 1000) return `${Math.round(price / 1000)}K`;
  return String(price);
};

const FlyToUser = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
};

const PropertiesMap = ({ properties }: PropertiesMapProps) => {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

  // Centro en Bogotá
  const bogotaCenter: [number, number] = [4.6510, -74.0817];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          // Si no da permiso, queda centrado en Bogotá
        },
      );
    }
  }, []);

  const propertiesWithCoords = properties.filter((p) => p.latitude && p.longitude);

  return (
    <div className="properties-map">
      {userPosition && (
        <div className="properties-map__user-banner">
          <span className="properties-map__user-dot" />
          Tu ubicación actual está marcada en el mapa
        </div>
      )}
      <MapContainer
        center={userPosition || bogotaCenter}
        zoom={userPosition ? 14 : 12}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToUser position={userPosition} />

        {/* Marcador del usuario */}
        {userPosition && (
          <>
            <Marker position={userPosition} icon={userIcon}>
              <Popup>
                <strong>Tu ubicación</strong>
              </Popup>
            </Marker>
            <Circle
              center={userPosition}
              radius={500}
              pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.06, weight: 1 }}
            />
          </>
        )}

        {/* Inmuebles */}
        {propertiesWithCoords.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude!, property.longitude!]}
          >
            <Tooltip direction="top" offset={[0, -35]} permanent className="properties-map__price-tooltip">
              ${formatPriceShort(property.price)}
            </Tooltip>
            <Popup>
              <div className="properties-map__popup">
                <h4 className="properties-map__popup-title">{property.title}</h4>
                <p className="properties-map__popup-price">{formatPrice(property.price)}</p>
                <p className="properties-map__popup-info">
                  {property.house_property_types?.name} · {property.house_transaction_types?.name}
                </p>
                <p className="properties-map__popup-location">
                  {property.house_localities?.name} · Estrato {property.house_strata?.level}
                </p>
                <a
                  href={`/inmuebles/${property.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="properties-map__popup-link"
                >
                  Ver detalle →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertiesMap;
