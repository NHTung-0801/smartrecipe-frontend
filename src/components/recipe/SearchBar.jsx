import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = 'Tìm món ăn, nguyên liệu...' }) => {
  const [value, setValue] = useState('');

  const handleClear = useCallback(() => {
    setValue('');
    onSearch?.('');
  }, [onSearch]);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch?.(value);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      {/* Glow effect on focus */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-rose-400/20 rounded-[28px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-center bg-white/80 backdrop-blur-xl border border-[var(--sr-outline-variant)] rounded-2xl shadow-lg shadow-orange-900/5
                      focus-within:border-[var(--sr-primary)] focus-within:shadow-xl focus-within:shadow-orange-500/10
                      transition-all duration-300">
        {/* Search icon */}
        <div className="pl-5 pr-3 text-[var(--sr-on-surface-variant)]">
          <Search size={20} className="group-focus-within:text-[var(--sr-primary)] transition-colors duration-300" />
        </div>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full py-4 pr-4 bg-transparent text-[var(--sr-on-surface)] placeholder:text-[var(--sr-outline)] 
                     outline-none text-base font-[family-name:var(--sr-font-body)]"
          aria-label="Tìm kiếm công thức"
        />

        {/* Clear button */}
        {value && (
          <button
            onClick={handleClear}
            className="mr-3 p-1.5 rounded-full text-[var(--sr-on-surface-variant)] hover:bg-gray-100 
                       hover:text-[var(--sr-error)] transition-all duration-200"
            aria-label="Xóa tìm kiếm"
          >
            <X size={16} />
          </button>
        )}

        {/* Search button */}
        <button
          onClick={() => onSearch?.(value)}
          className="mr-2 px-5 py-2.5 bg-[var(--sr-primary)] text-white rounded-xl font-semibold text-sm
                     hover:bg-[var(--sr-primary-light)] active:scale-95
                     transition-all duration-200 shadow-md shadow-orange-900/20 hover:shadow-lg hover:shadow-orange-900/30"
        >
          Tìm
        </button>
      </div>
    </div>
  );
};

export default SearchBar;