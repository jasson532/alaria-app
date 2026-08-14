import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Play, Maximize2 } from 'lucide-react';
import type { PropertyMedia } from 'modules/properties/types';
import './MediaGallery.scss';

interface MediaGalleryProps {
  media: PropertyMedia[];
  onClose: () => void;
  startIndex?: number;
}

const MediaGallery = ({ media, onClose, startIndex = 0 }: MediaGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fading, setFading] = useState(false);
  const touchStartX = useRef(0);

  const sorted = [...media].sort((a, b) => {
    if (a.is_cover && !b.is_cover) return -1;
    if (!a.is_cover && b.is_cover) return 1;
    return a.sort_order - b.sort_order;
  });

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, sorted.length - 1));
    if (clamped === currentIndex) return;
    setFading(true);
    setTimeout(() => {
      setCurrentIndex(clamped);
      setFading(false);
    }, 200);
  }, [sorted.length, currentIndex]);

  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        else onClose();
      }
      else if (e.key === 'f' || e.key === 'F') setIsFullscreen((v) => !v);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goPrev, goNext, onClose, isFullscreen]);

  if (sorted.length === 0) return null;

  const current = sorted[currentIndex];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) goNext();
    else if (diff < -50) goPrev();
  };

  return (
    <div className={`media-gallery__overlay ${isFullscreen ? 'media-gallery__overlay--fullscreen' : ''}`} onClick={onClose}>
      <button className="media-gallery__close" onClick={onClose}>
        <X size={24} />
      </button>

      {/* Fullscreen toggle */}
      <button
        className="media-gallery__fullscreen-toggle"
        onClick={(e) => { e.stopPropagation(); setIsFullscreen(!isFullscreen); }}
        title={isFullscreen ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)'}
      >
        <Maximize2 size={20} />
      </button>

      {/* Main content */}
      <div className="media-gallery__content" onClick={(e) => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {current.file_type === 'video' ? (
          <video src={current.file_url} controls autoPlay playsInline className={`media-gallery__media ${fading ? 'media-gallery__media--fading' : ''}`} />
        ) : (
          <img src={current.file_url} alt={current.file_name} className={`media-gallery__media ${fading ? 'media-gallery__media--fading' : ''}`} />
        )}
      </div>

      {/* Arrows */}
      {sorted.length > 1 && (
        <>
          <button
            className="media-gallery__arrow media-gallery__arrow--left"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={32} />
          </button>
          <button
            className="media-gallery__arrow media-gallery__arrow--right"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            disabled={currentIndex === sorted.length - 1}
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Thumbnails */}
      {!isFullscreen && (
        <div className="media-gallery__thumbs" onClick={(e) => e.stopPropagation()}>
          {sorted.map((item, index) => (
            <button
              key={item.id}
              className={`media-gallery__thumb ${index === currentIndex ? 'media-gallery__thumb--active' : ''}`}
              onClick={() => goTo(index)}
            >
              {item.file_type === 'video' ? (
                <div className="media-gallery__thumb-video"><Play size={12} /></div>
              ) : (
                <img src={item.file_url} alt={item.file_name} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Counter */}
      <span className="media-gallery__counter">
        {currentIndex + 1} / {sorted.length}
      </span>
    </div>
  );
};

export default MediaGallery;
