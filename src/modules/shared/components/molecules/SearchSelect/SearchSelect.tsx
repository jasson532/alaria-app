import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import './SearchSelect.scss';

interface SearchSelectOption {
  value: string;
  label: string;
}

interface SearchSelectProps {
  options: SearchSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchSelect = ({ options, value, onChange, placeholder = 'Seleccionar...' }: SearchSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label || '';

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setSearch('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div className="search-select" ref={containerRef}>
      <button
        type="button"
        className={`search-select__trigger ${isOpen ? 'search-select__trigger--open' : ''}`}
        onClick={handleOpen}
      >
        <span className={`search-select__value ${!value ? 'search-select__value--placeholder' : ''}`}>
          {value ? selectedLabel : placeholder}
        </span>
        {value ? (
          <X size={16} className="search-select__clear" onClick={handleClear} />
        ) : (
          <ChevronDown size={16} className="search-select__chevron" />
        )}
      </button>

      {isOpen && (
        <div className="search-select__dropdown">
          <div className="search-select__search">
            <Search size={14} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="search-select__options">
            {filtered.length === 0 ? (
              <div className="search-select__empty">Sin resultados</div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`search-select__option ${option.value === value ? 'search-select__option--selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSelect;
