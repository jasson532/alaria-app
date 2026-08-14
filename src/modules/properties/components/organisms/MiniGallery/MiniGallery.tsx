import { useState, useRef } from 'react';
import { Maximize2, Play } from 'lucide-react';
import type { PropertyMedia } from 'modules/properties/types';
import './MiniGallery.scss';

interface MiniGalleryProps {
  media: PropertyMedia[];
  onFullscreen: (startIndex: number) => void;
}

const MiniGallery = ({ media, onFullscreen }: MiniGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);

  const sorted = [...media].sort((a, b) => a.sort_order - b.sort_order);

  if (sorted.length === 0) return null;

  const active = sorted[activeIndex];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50 && activeIndex < sorted.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else if (diff < -50 && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  return (
    <div className="mini-gallery">
      {/* Preview grande arriba */}
      <div className="mini-gallery__preview" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {active.file_type === 'video' ? (
          <video src={active.file_url} className="mini-gallery__preview-media" controls playsInline />
        ) : (
          <img src={active.file_url} alt={active.file_name} className="mini-gallery__preview-media" />
        )}
        <button
          className="mini-gallery__fullscreen-btn"
          onClick={() => onFullscreen(activeIndex)}
          title="Ver en pantalla completa"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Thumbnails abajo */}
      {sorted.length > 1 && (
        <div className="mini-gallery__thumbs">
          {sorted.map((item, index) => (
            <button
              key={item.id}
              className={`mini-gallery__thumb ${index === activeIndex ? 'mini-gallery__thumb--active' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              {item.file_type === 'video' ? (
                <div className="mini-gallery__thumb-video"><Play size={10} /></div>
              ) : (
                <img src={item.file_url} alt={item.file_name} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MiniGallery;
