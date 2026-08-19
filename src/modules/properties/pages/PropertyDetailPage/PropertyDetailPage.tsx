import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, BedDouble, Bath, Car, Maximize2, Calendar, Heart, Check, ImageOff, Pencil, MessageCircle, Trash2, Share2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import { useLoader } from 'modules/shared/hooks/useLoader';
import { fetchPropertyById } from 'modules/properties/store/propertiesSlice';
import { favoritesService } from 'modules/properties/services/favoritesService';
import { appointmentsService } from 'modules/appointments/services/appointmentsService';
import { propertiesService } from 'modules/properties/services/propertiesService';
import { supabase } from 'modules/shared/services/supabase';
import { useConfirm } from 'modules/shared/hooks/useConfirm';
import ConfirmModal from 'modules/shared/components/molecules/ConfirmModal/ConfirmModal';
import { ROUTES } from 'modules/shared/constants/routes';
import PropertyMap from 'modules/properties/components/organisms/PropertyMap/PropertyMap';
import MediaGallery from 'modules/properties/components/organisms/MediaGallery/MediaGallery';
import MiniGallery from 'modules/properties/components/organisms/MiniGallery/MiniGallery';
import './PropertyDetailPage.scss';

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedProperty: property, isLoading } = useAppSelector((state) => state.properties);
  const { isAuthenticated, role, user } = useAppSelector((state) => state.auth);
  const { withLoader } = useLoader();

  const [isFavorite, setIsFavorite] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [appointmentSuccess, setAppointmentSuccess] = useState('');
  const [favoriteMsg, setFavoriteMsg] = useState('');
  const [scheduleContact, setScheduleContact] = useState<{ full_name: string; phone: string } | null>(null);
  const [availableSchedules, setAvailableSchedules] = useState<{ id: string; schedule_date: string; schedule_time: string }[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const confirmModal = useConfirm();

  useEffect(() => {
    if (id) dispatch(fetchPropertyById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (user?.id && id) {
      favoritesService.isFavorite(id, user.id).then(setIsFavorite);
    }
  }, [user?.id, id]);

  useEffect(() => {
    if (id) {
      loadSchedules();
    }
  }, [id]);

  const loadSchedules = async () => {
    const { data } = await supabase
      .from('house_schedules')
      .select('id, schedule_date, schedule_time, house_contacts(full_name, phone)')
      .eq('property_id', id!)
      .eq('is_available', true)
      .gte('schedule_date', new Date().toISOString().split('T')[0])
      .order('schedule_date', { ascending: true });
    if (data && data.length > 0) {
      setAvailableSchedules(data.map((s) => ({ id: s.id, schedule_date: s.schedule_date, schedule_time: s.schedule_time })));
      setScheduleContact((data[0] as unknown as { house_contacts: { full_name: string; phone: string } }).house_contacts);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user?.id || !id) return;
    await withLoader(async () => {
      const result = await favoritesService.toggle(id, user.id);
      setIsFavorite(result);
      setFavoriteMsg(result ? 'Agregado a favoritos' : 'Eliminado de favoritos');
      setTimeout(() => setFavoriteMsg(''), 3000);
    });
  };

  const handleSubmitAppointment = async () => {
    if (!user?.id || !id) return;

    await withLoader(async () => {
      // Si hay schedules disponibles, usar el seleccionado
      if (availableSchedules.length > 0 && selectedSchedule) {
        const schedule = availableSchedules.find((s) => s.id === selectedSchedule);
        if (!schedule) return;
        try {
          await appointmentsService.create({
            property_id: id,
            appointment_date: schedule.schedule_date,
            appointment_time: schedule.schedule_time,
            notes: appointmentNotes || undefined,
          }, user.id);
          await supabase.from('house_schedules').update({ is_available: false }).eq('id', selectedSchedule);
          setAppointmentSuccess('Visita agendada exitosamente. Te contactaremos para confirmar.');
          setShowAppointmentForm(false);
          setSelectedSchedule('');
          setAppointmentNotes('');
          loadSchedules();
        } catch {
          setAppointmentSuccess('Error al agendar. Intenta de nuevo.');
        }
      } else if (appointmentDate && appointmentTime) {
        try {
          await appointmentsService.create({
            property_id: id,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            notes: appointmentNotes || undefined,
          }, user.id);
          setAppointmentSuccess('Visita agendada exitosamente. Te contactaremos para confirmar.');
          setShowAppointmentForm(false);
          setAppointmentDate('');
          setAppointmentTime('');
          setAppointmentNotes('');
        } catch {
          setAppointmentSuccess('Error al agendar. Intenta de nuevo.');
        }
      }
    });
  };

  if (isLoading || !property) {
    return <div className="property-detail__loading">Cargando inmueble...</div>;
  }

  const handleDeleteProperty = async () => {
    confirmModal.confirm({
      title: 'Eliminar inmueble',
      message: '¿Estás seguro de eliminar este inmueble? No aparecerá más en el listado.',
      confirmLabel: 'Eliminar',
      variant: 'danger',
      onConfirm: async () => {
        await withLoader(async () => {
          await propertiesService.toggleActive(property.id, false);
        });
        confirmModal.close();
        navigate(ROUTES.PROPERTIES);
      },
    });
  };

  const photos = property.house_property_media?.filter((m) => m.file_type === 'photo') || [];
  const coverImage = photos.find((p) => p.is_cover) || photos[0];
  const restPhotos = photos.filter((p) => p.id !== coverImage?.id);
  const transactionType = property.house_transaction_types?.name?.toLowerCase();
  const badgeClass = transactionType === 'venta' ? 'property-detail__badge--sale' : 'property-detail__badge--rent';

  const amenities: { label: string; active: boolean }[] = [
    { label: 'Balcón', active: property.has_balcony },
    { label: 'Ascensor', active: property.has_elevator },
    { label: 'Gimnasio', active: property.has_gym },
    { label: 'Piscina', active: property.has_pool },
    { label: 'Seguridad 24h', active: property.has_security },
  ];

  return (
    <div className="property-detail">
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.close}
      />

      <button className="property-detail__back" onClick={() => navigate(ROUTES.PROPERTIES)}>
        <ArrowLeft size={18} />
        Volver a la lista
      </button>

      {role === 'admin' && (
        <button
          className="property-detail__edit-btn"
          onClick={() => navigate(`/admin/inmuebles/editar/${property.id}`)}
          title="Editar inmueble"
        >
          <Pencil size={20} />
        </button>
      )}

      {role === 'admin' && (
        <button
          className="property-detail__delete-btn"
          onClick={handleDeleteProperty}
          title="Eliminar inmueble"
        >
          <Trash2 size={20} />
        </button>
      )}

      <button
        className="property-detail__share-btn"
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: property.title,
              text: `Mira este inmueble en Alaria: ${property.title}`,
              url: window.location.href,
            });
          } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copiado al portapapeles');
          }
        }}
        title="Compartir"
      >
        <Share2 size={20} />
      </button>

      {/* Galería */}
      {photos.length > 0 ? (
        <>
          {/* Desktop: portada + mini gallery */}
          <div className="property-detail__gallery property-detail__gallery--desktop">
            <img
              className="property-detail__main-image"
              src={coverImage?.file_url || photos[0].file_url}
              alt={property.title}
            />
            {restPhotos.length > 0 && (
              <div className="property-detail__mini-gallery">
                <MiniGallery
                  media={restPhotos}
                  onFullscreen={(index) => { setGalleryIndex(index + 1); setGalleryOpen(true); }}
                />
              </div>
            )}
          </div>

          {/* Mobile: solo carrusel */}
          <div className="property-detail__gallery property-detail__gallery--mobile">
            <MiniGallery
              media={photos}
              onFullscreen={(index) => { setGalleryIndex(index); setGalleryOpen(true); }}
            />
          </div>
        </>
      ) : (
        <div className="property-detail__no-images">
          <ImageOff size={64} />
        </div>
      )}

      {/* Gallery fullscreen */}
      {galleryOpen && (
        <MediaGallery media={property.house_property_media || []} onClose={() => setGalleryOpen(false)} startIndex={galleryIndex} />
      )}

      {/* Content */}
      <div className="property-detail__content">
        <div className="property-detail__info">
          <div className="property-detail__header">
            <div>
              <h1 className="property-detail__title">{property.title}</h1>
              {role === 'admin' && property.house_users?.full_name && (
                <span className="property-detail__admin-tag">{property.house_users.full_name.split(' ')[0]}</span>
              )}
              <div className="property-detail__location">
                <MapPin size={16} />
                <span>{property.address} - {property.house_localities?.name}</span>
              </div>
            </div>
            <span className={`property-detail__badge ${badgeClass}`}>
              {property.house_transaction_types?.name}
            </span>
          </div>

          <div>
            <p className="property-detail__price">{formatPrice(property.price)}</p>
            {property.admin_fee > 0 && (
              <p className="property-detail__admin-fee">
                Administración: {formatPrice(property.admin_fee)} / mes
              </p>
            )}
          </div>

          <div className="property-detail__features">
            <div className="property-detail__feature">
              <BedDouble size={20} />
              <span className="property-detail__feature-value">{property.bedrooms}</span>
              <span className="property-detail__feature-label">Habitaciones</span>
            </div>
            <div className="property-detail__feature">
              <Bath size={20} />
              <span className="property-detail__feature-value">{property.bathrooms}</span>
              <span className="property-detail__feature-label">Baños</span>
            </div>
            <div className="property-detail__feature">
              <Car size={20} />
              <span className="property-detail__feature-value">{property.parking_spaces}</span>
              <span className="property-detail__feature-label">Parqueaderos</span>
            </div>
            <div className="property-detail__feature">
              <Maximize2 size={20} />
              <span className="property-detail__feature-value">{property.area_m2}</span>
              <span className="property-detail__feature-label">m²</span>
            </div>
          </div>

          {property.description && (
            <div className="property-detail__description">
              <h3>Descripción</h3>
              <p>{property.description}</p>
            </div>
          )}

          <div className="property-detail__amenities">
            <h3>Amenidades</h3>
            <div className="property-detail__amenities-grid">
              {amenities.filter((a) => a.active).map((amenity) => (
                <span key={amenity.label} className="property-detail__amenity">
                  <Check size={14} />
                  {amenity.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="property-detail__sidebar">
          <div className="property-detail__cta-card">
            <h4 className="property-detail__cta-title">¿Te interesa este inmueble?</h4>
            {isAuthenticated ? (
              <>
                {appointmentSuccess && (
                  <div className="property-detail__cta-success">{appointmentSuccess}</div>
                )}

                {!showAppointmentForm ? (
                  <button
                    className="property-detail__cta-btn property-detail__cta-btn--primary"
                    onClick={() => setShowAppointmentForm(true)}
                  >
                    <Calendar size={18} />
                    Agendar Visita
                  </button>
                ) : (
                  <div className="property-detail__appointment-form">
                    {availableSchedules.length > 0 ? (
                      <div className="property-detail__form-field">
                        <label>Fecha y hora disponible</label>
                        <select
                          value={selectedSchedule}
                          onChange={(e) => setSelectedSchedule(e.target.value)}
                        >
                          <option value="">Seleccionar horario...</option>
                          {availableSchedules.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.schedule_date} - {s.schedule_time.slice(0, 5)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        <div className="property-detail__form-field">
                          <label>Fecha</label>
                          <input
                            type="date"
                            value={appointmentDate}
                            onChange={(e) => setAppointmentDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="property-detail__form-field">
                          <label>Hora</label>
                          <input
                            type="time"
                            value={appointmentTime}
                            onChange={(e) => setAppointmentTime(e.target.value)}
                          />
                        </div>
                      </>
                    )}
                    <div className="property-detail__form-field">
                      <label>Notas (opcional)</label>
                      <textarea
                        value={appointmentNotes}
                        onChange={(e) => setAppointmentNotes(e.target.value)}
                        placeholder="Ej: Prefiero en la mañana..."
                        rows={2}
                      />
                    </div>
                    <div className="property-detail__form-actions">
                      <button
                        className="property-detail__cta-btn property-detail__cta-btn--primary"
                        onClick={handleSubmitAppointment}
                        disabled={availableSchedules.length > 0 ? !selectedSchedule : (!appointmentDate || !appointmentTime)}
                      >
                        Confirmar Cita
                      </button>
                      <button
                        className="property-detail__cta-btn property-detail__cta-btn--outline"
                        onClick={() => setShowAppointmentForm(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {scheduleContact && (
                  <a
                    href={`https://wa.me/57${scheduleContact.phone}?text=Hola ${scheduleContact.full_name}, estoy interesado en el inmueble: ${property.title} - ${window.location.href}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="property-detail__cta-btn property-detail__cta-btn--whatsapp"
                  >
                    <MessageCircle size={18} />
                    WhatsApp - {scheduleContact.full_name}
                  </a>
                )}

                <button
                  className={`property-detail__cta-btn property-detail__cta-btn--outline ${isFavorite ? 'property-detail__cta-btn--favorited' : ''}`}
                  onClick={handleToggleFavorite}
                >
                  <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                  {isFavorite ? 'En Favoritos' : 'Guardar en Favoritos'}
                </button>
                {favoriteMsg && <p className="property-detail__cta-msg">{favoriteMsg}</p>}
              </>
            ) : (
              <>
                <button
                  className="property-detail__cta-btn property-detail__cta-btn--primary"
                  onClick={() => navigate(ROUTES.LOGIN)}
                >
                  Inicia sesión para agendar
                </button>
                <p className="property-detail__login-hint">
                  ¿No tienes cuenta? <Link to={ROUTES.REGISTER}>Regístrate</Link>
                </p>
              </>
            )}
          </div>

          {property.latitude && property.longitude && (
            <div className="property-detail__map-card">
              <h4 className="property-detail__map-title">Ubicación</h4>
              <div className="property-detail__map-container">
                <PropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  title={property.title}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
