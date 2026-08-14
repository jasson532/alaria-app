import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';
import './LocationPicker.scss';

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

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

const MapClickHandler = ({ onClick }: { onClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const FlyTo = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { duration: 1 });
    }
  }, [position, map]);
  return null;
};

const LocationPicker = ({ latitude, longitude, onChange }: LocationPickerProps) => {
  const [position, setPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null,
  );
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

  // Sincronizar posición cuando las props cambian (ej: edición carga datos del inmueble)
  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
      setFlyTarget([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // Obtener ubicación actual al montar — solo si NO hay coordenadas previas del inmueble
  useEffect(() => {
    if (!latitude && !longitude) {
      getUserLocation();
    }
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        // Si no hay posición previa, centrar y seleccionar automáticamente
        if (!position) {
          setPosition(coords);
          setFlyTarget(coords);
          onChange(coords[0], coords[1]);
        } else {
          setFlyTarget(coords);
        }
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
    );
  };

  // Centro por defecto: Bogotá
  const center: [number, number] = position || userLocation || [4.6510, -74.0817];

  const handleClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onChange(lat, lng);
  };

  return (
    <div className="location-picker">
      <div className="location-picker__toolbar">
        <p className="location-picker__hint">
          <MapPin size={14} />
          Haz clic en el mapa para seleccionar la ubicación del inmueble
        </p>
        <button
          type="button"
          className="location-picker__geolocate-btn"
          onClick={getUserLocation}
          disabled={locating}
          title="Ir a mi ubicación actual"
        >
          <Navigation size={14} />
          {locating ? 'Ubicando...' : 'Mi ubicación'}
        </button>
      </div>
      <div className="location-picker__map">
        <MapContainer
          center={center}
          zoom={position ? 16 : 12}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onClick={handleClick} />
          <FlyTo position={flyTarget} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>
      {position && (
        <div className="location-picker__coords">
          <span>Lat: <strong>{position[0].toFixed(6)}</strong></span>
          <span>Lng: <strong>{position[1].toFixed(6)}</strong></span>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
