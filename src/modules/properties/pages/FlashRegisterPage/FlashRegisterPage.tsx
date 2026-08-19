import { useState, useRef } from 'react';
import { Camera, MapPin, Check, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from 'modules/shared/hooks/useAppDispatch';
import { useLoader } from 'modules/shared/hooks/useLoader';
import { supabase } from 'modules/shared/services/supabase';
import { propertiesService } from 'modules/properties/services/propertiesService';
import LocationPicker from 'modules/properties/components/organisms/LocationPicker/LocationPicker';
import { ROUTES } from 'modules/shared/constants/routes';
import './FlashRegisterPage.scss';

const FlashRegisterPage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { withLoader } = useLoader();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'photo' | 'location' | 'title'>('photo');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [cameraError, setCameraError] = useState('');

  const handleOpenCamera = async () => {
    setCameraError('');
    // Solicitar permisos de cámara explícitamente
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      // Permisos otorgados - cerrar stream y abrir input nativo
      stream.getTracks().forEach((track) => track.stop());
      cameraInputRef.current?.click();
    } catch {
      // Si falla getUserMedia, intentar directamente con el input (fallback iOS)
      cameraInputRef.current?.click();
    }
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setStep('location');
  };

  const handleLocationConfirm = () => {
    if (latitude && longitude) {
      setStep('title');
    }
  };

  const handleSave = async () => {
    if (!user?.id || !photo || !title.trim()) return;

    await withLoader(async () => {
      // Obtener IDs de catálogos con valor "pendiente"
      const [typeRes, transRes, stateRes, locRes, stratRes] = await Promise.all([
        supabase.from('house_property_types').select('id').limit(1).single(),
        supabase.from('house_transaction_types').select('id').limit(1).single(),
        supabase.from('house_property_states').select('id').eq('name', 'Pendiente').single(),
        supabase.from('house_localities').select('id').limit(1).single(),
        supabase.from('house_strata').select('id').limit(1).single(),
      ]);

      // Crear inmueble con datos mínimos
      const { data: property, error } = await supabase
        .from('house_properties')
        .insert({
          title: title.trim(),
          description: 'Pendiente',
          address: 'Pendiente',
          neighborhood: 'Pendiente',
          locality_id: locRes.data?.id,
          stratum_id: stratRes.data?.id,
          property_type_id: typeRes.data?.id,
          transaction_type_id: transRes.data?.id,
          state_id: stateRes.data?.id,
          price: 0,
          admin_fee: 0,
          area_m2: 0,
          bedrooms: 0,
          bathrooms: 0,
          parking_spaces: 0,
          latitude,
          longitude,
          is_active: true,
          created_by: user.id,
        })
        .select('id')
        .single();

      if (error || !property) throw error;

      // Subir foto
      await propertiesService.uploadMedia(property.id, photo, true);

      navigate(ROUTES.PROPERTIES);
    });
  };

  return (
    <div className="flash-register">
      <h1 className="flash-register__title">Registro Flash</h1>

      {/* Step 1: Foto */}
      {step === 'photo' && (
        <div className="flash-register__step">
          {photoPreview ? (
            <div className="flash-register__preview">
              <img src={photoPreview} alt="Captura" />
              <button className="flash-register__btn flash-register__btn--primary" onClick={() => setStep('location')}>
                <Check size={18} />
                Continuar
              </button>
              <button className="flash-register__btn flash-register__btn--secondary" onClick={() => { setPhoto(null); setPhotoPreview(''); }}>
                Tomar otra
              </button>
            </div>
          ) : (
            <div className="flash-register__capture">
              <div className="flash-register__capture-options">
                <button className="flash-register__capture-btn" onClick={handleOpenCamera} type="button">
                  <Camera size={36} />
                  <span>Tomar foto</span>
                </button>
                <button className="flash-register__capture-btn flash-register__capture-btn--secondary" onClick={() => fileInputRef.current?.click()} type="button">
                  <Upload size={36} />
                  <span>Subir archivo</span>
                </button>
              </div>
              {cameraError && <p className="flash-register__camera-error">{cameraError}</p>}
              {/* Input para cámara (iOS/Android) */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCapture}
                style={{ display: 'none' }}
              />
              {/* Input para galería/archivos */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCapture}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Step 2: Ubicación */}
      {step === 'location' && (
        <div className="flash-register__step">
          <p className="flash-register__step-label">Selecciona la ubicación del inmueble</p>
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }}
          />
          <button
            className="flash-register__btn flash-register__btn--primary"
            onClick={handleLocationConfirm}
            disabled={!latitude || !longitude}
          >
            <MapPin size={18} />
            Confirmar ubicación
          </button>
        </div>
      )}

      {/* Step 3: Título */}
      {step === 'title' && (
        <div className="flash-register__step">
          <p className="flash-register__step-label">Nombre del inmueble</p>
          <input
            className="flash-register__input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Apartamento Calle 72"
            autoFocus
          />
          <div className="flash-register__summary">
            <img src={photoPreview} alt="Foto" className="flash-register__summary-img" />
            <span className="flash-register__summary-coords">
              {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
            </span>
          </div>
          <button
            className="flash-register__btn flash-register__btn--primary"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            <Check size={18} />
            Guardar
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashRegisterPage;
