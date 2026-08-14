import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { propertiesService } from 'modules/properties/services/propertiesService';
import type { PropertyMedia } from 'modules/properties/types';
import './MediaUploader.scss';

interface MediaUploaderProps {
  propertyId: string;
  existingMedia?: PropertyMedia[];
  onUploadComplete?: () => void;
}

interface FilePreview {
  file: File;
  preview: string;
}

const MediaUploader = ({ propertyId, existingMedia = [], onUploadComplete }: MediaUploaderProps) => {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const isCover = existingMedia.length === 0 && i === 0;
        await propertiesService.uploadMedia(propertyId, files[i].file, isCover);
      }
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);
      onUploadComplete?.();
    } catch (err) {
      console.error('Error uploading:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!window.confirm('¿Eliminar este archivo?')) return;
    await propertiesService.deleteMedia(mediaId);
    onUploadComplete?.();
  };

  return (
    <div className="media-uploader">
      <div
        className={`media-uploader__dropzone ${isDragActive ? 'media-uploader__dropzone--active' : ''}`}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <Upload size={32} className="media-uploader__icon" />
        <p className="media-uploader__text">
          {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra fotos o videos, o haz clic para seleccionar'}
        </p>
        <p className="media-uploader__hint">JPG, PNG, WebP, MP4, MOV (máx. 50MB)</p>
      </div>

      {/* Archivos existentes */}
      {existingMedia.length > 0 && (
        <div className="media-uploader__preview">
          {existingMedia.map((media) => (
            <div key={media.id} className="media-uploader__preview-item">
              {media.file_type === 'photo' ? (
                <img src={media.file_url} alt={media.file_name} />
              ) : (
                <video src={media.file_url} />
              )}
              {media.is_cover && <span className="media-uploader__cover-badge">Portada</span>}
              <button className="media-uploader__remove-btn" onClick={() => handleDeleteMedia(media.id)}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Archivos por subir */}
      {files.length > 0 && (
        <>
          <div className="media-uploader__preview">
            {files.map((filePreview, index) => (
              <div key={index} className="media-uploader__preview-item">
                {filePreview.file.type.startsWith('video/') ? (
                  <video src={filePreview.preview} />
                ) : (
                  <img src={filePreview.preview} alt={filePreview.file.name} />
                )}
                <button className="media-uploader__remove-btn" onClick={() => removeFile(index)}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            style={{
              marginTop: '1rem',
              padding: '0.625rem 1.5rem',
              backgroundColor: '#2563eb',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {isUploading ? 'Subiendo...' : `Subir ${files.length} archivo(s)`}
          </button>
        </>
      )}

      {isUploading && <p className="media-uploader__uploading">Subiendo archivos, por favor espera...</p>}
    </div>
  );
};

export default MediaUploader;
