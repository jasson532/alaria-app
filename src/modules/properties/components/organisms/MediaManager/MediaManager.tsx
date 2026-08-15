import { useState } from 'react';
import { Star, Trash2, ArrowLeft, ArrowRight, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from 'modules/shared/services/supabase';
import { propertiesService } from 'modules/properties/services/propertiesService';
import { useLoader } from 'modules/shared/hooks/useLoader';
import { useConfirm } from 'modules/shared/hooks/useConfirm';
import ConfirmModal from 'modules/shared/components/molecules/ConfirmModal/ConfirmModal';
import type { PropertyMedia } from 'modules/properties/types';
import './MediaManager.scss';

interface MediaManagerProps {
  propertyId: string;
  media: PropertyMedia[];
  onUpdate: () => void;
}

const MediaManager = ({ propertyId, media, onUpdate }: MediaManagerProps) => {
  const { withLoader } = useLoader();
  const modal = useConfirm();
  const [uploading, setUploading] = useState(false);

  const sorted = [...media].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.created_at.localeCompare(b.created_at);
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (files) => {
      setUploading(true);
      await withLoader(async () => {
        for (const file of files) {
          const isCover = media.length === 0;
          await propertiesService.uploadMedia(propertyId, file, isCover);
        }
      });
      setUploading(false);
      onUpdate();
    },
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'video/*': ['.mp4', '.mov'],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const handleSetCover = async (id: string) => {
    await withLoader(async () => {
      // Quitar cover actual
      await supabase.from('house_property_media').update({ is_cover: false }).eq('property_id', propertyId);
      // Poner nuevo cover
      await supabase.from('house_property_media').update({ is_cover: true }).eq('id', id);
    });
    onUpdate();
  };

  const handleMoveLeft = async (index: number) => {
    if (index === 0) return;
    await withLoader(async () => {
      const current = sorted[index];
      const prev = sorted[index - 1];
      await supabase.from('house_property_media').update({ sort_order: index - 1 }).eq('id', current.id);
      await supabase.from('house_property_media').update({ sort_order: index }).eq('id', prev.id);
    });
    onUpdate();
  };

  const handleMoveRight = async (index: number) => {
    if (index === sorted.length - 1) return;
    await withLoader(async () => {
      const current = sorted[index];
      const next = sorted[index + 1];
      await supabase.from('house_property_media').update({ sort_order: index + 1 }).eq('id', current.id);
      await supabase.from('house_property_media').update({ sort_order: index }).eq('id', next.id);
    });
    onUpdate();
  };

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeleteId(id);
    modal.confirm({
      title: 'Eliminar archivo',
      message: '¿Eliminar esta imagen o video?',
      confirmLabel: 'Eliminar',
      variant: 'danger',
      onConfirm: async () => {
        await withLoader(async () => {
          await propertiesService.deleteMedia(id);
        });
        modal.close();
        setDeleteId(null);
        onUpdate();
      },
    });
  };

  return (
    <div className="media-manager">
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        variant={modal.variant}
        onConfirm={modal.onConfirm}
        onCancel={modal.close}
      />

      {/* Dropzone */}
      <div
        className={`media-manager__dropzone ${isDragActive ? 'media-manager__dropzone--active' : ''}`}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <Upload size={24} />
        <span>{uploading ? 'Subiendo...' : 'Arrastra o haz clic para subir'}</span>
      </div>

      {/* Grid de archivos */}
      {sorted.length > 0 && (
        <div className="media-manager__grid">
          {sorted.map((item, index) => (
            <div key={item.id} className={`media-manager__item ${item.is_cover ? 'media-manager__item--cover' : ''}`}>
              {item.file_type === 'video' ? (
                <video src={item.file_url} className="media-manager__preview" />
              ) : (
                <img src={item.file_url} alt={item.file_name} className="media-manager__preview" />
              )}

              {item.is_cover && <span className="media-manager__cover-badge">Portada</span>}

              <div className="media-manager__actions">
                {!item.is_cover && (
                  <button
                    type="button"
                    className="media-manager__action media-manager__action--cover"
                    onClick={() => handleSetCover(item.id)}
                    title="Hacer portada"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  type="button"
                  className="media-manager__action"
                  onClick={() => handleMoveLeft(index)}
                  disabled={index === 0}
                  title="Mover a la izquierda"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  className="media-manager__action"
                  onClick={() => handleMoveRight(index)}
                  disabled={index === sorted.length - 1}
                  title="Mover a la derecha"
                >
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  className="media-manager__action media-manager__action--delete"
                  onClick={() => handleDelete(item.id)}
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaManager;
