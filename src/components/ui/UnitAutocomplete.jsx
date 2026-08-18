import { useState, useEffect, useRef } from 'react';

const COMMON_UNITS = [
  'g', 'kg', 'ml', 'l',
  'muỗng cà phê', 'muỗng canh', 'chén',
  'cái', 'quả', 'củ', 'nhánh', 'mớ', 'bó', 
  'túi', 'hộp', 'lon', 'gói', 'chai',
  'miếng', 'lát', 'cây'
];

export default function UnitAutocomplete({ value, onChange, className, inputClassName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = COMMON_UNITS.filter((u) =>
    u.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (unit) => {
    setQuery(unit);
    setIsOpen(false);
    onChange?.(unit);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    onChange?.(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsOpen(false);
      onChange?.(query);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative flex-shrink-0 ${className || ''}`}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        placeholder="đơn vị"
        className={inputClassName || "w-20 px-2.5 py-2 border border-gray-300 rounded-r-lg bg-gray-50 text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"}
        autoComplete="off"
      />
      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-50 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto w-24">
          {filtered.map((unit) => (
            <li
              key={unit}
              onClick={() => handleSelect(unit)}
              className={`px-3 py-1.5 text-sm cursor-pointer transition-colors hover:bg-orange-50 hover:text-orange-700 text-gray-700 ${
                unit === value ? 'bg-orange-50 text-orange-600 font-medium' : ''
              }`}
            >
              {unit}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}