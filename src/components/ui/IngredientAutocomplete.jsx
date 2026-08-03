import { useState, useEffect, useRef, useCallback } from 'react';
import { ingredientService } from '../../services/ingredientService';

/**
 * Component Autocomplete tìm kiếm nguyên liệu
 * @param {Object} props
 * @param {Function} props.onSelect - callback khi chọn nguyên liệu, truyền object ingredient
 * @param {string} props.placeholder - placeholder text
 * @param {Object} props.defaultValue - giá trị mặc định { id, name }
 */
const IngredientAutocomplete = ({ onSelect, placeholder = 'Tìm kiếm nguyên liệu...', defaultValue }) => {
  const [query, setQuery] = useState(defaultValue?.name || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (defaultValue && defaultValue.name) {
      setQuery(defaultValue.name);
    }
  }, [defaultValue]);

  // Cleanup debounce timer khi component unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (keyword) => {
    if (!keyword || keyword.trim().length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await ingredientService.search(keyword.trim());
      const data = response.data || [];
      setSuggestions(data);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Lỗi tìm kiếm nguyên liệu:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSelect = (ingredient) => {
    setQuery(ingredient.name);
    setIsOpen(false);
    setSuggestions([]);
    if (onSelect) {
      onSelect(ingredient);
    }
  };

  const handleCreateNew = async () => {
    if (!query.trim()) return;
    setCreating(true);
    try {
      const newIngredient = {
        name: query.trim(),
        baseUnit: 'g',
        caloriesPer100g: 0,
        protein: 0,
        fat: 0,
        carbs: 0
      };
      const response = await ingredientService.create(newIngredient);
      const createdIngredient = response.data;
      handleSelect(createdIngredient);
    } catch (error) {
      console.error('Lỗi tạo nguyên liệu mới:', error);
      alert('Không thể tạo nguyên liệu mới!');
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    if (onSelect) {
      onSelect(null);
    }
  };

  const highlightMatch = (text, keyword) => {
    if (!keyword || !text) return text;
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="font-semibold text-orange-600">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 pr-10"
          autoComplete="off"
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}

        {!loading && query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && !loading && query && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((ingredient, index) => (
            <li
              key={ingredient.id}
              onClick={() => handleSelect(ingredient)}
              className={`px-4 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                index === selectedIndex ? 'bg-orange-50 text-orange-700' : 'hover:bg-gray-50 text-gray-700'
              }`}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span>{highlightMatch(ingredient.name, query)}</span>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="px-2 py-0.5 bg-gray-100 rounded">{ingredient.baseUnit}</span>
                {ingredient.aisle && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                    {ingredient.aisle.name}
                  </span>
                )}
              </div>
            </li>
          ))}
          
          {/* Option to create a new ingredient if it doesn't match exactly */}
          {!suggestions.some((ing) => ing.name.toLowerCase() === query.trim().toLowerCase()) && (
            <li
              onClick={creating ? null : handleCreateNew}
              className={`px-4 py-2.5 cursor-pointer flex items-center gap-2 transition-colors border-t border-gray-100 text-orange-600 hover:bg-orange-50 ${creating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">
                {creating ? 'Đang tạo...' : `Tạo mới nguyên liệu: "${query.trim()}"`}
              </span>
            </li>
          )}
        </ul>
      )}


    </div>
  );
};

export default IngredientAutocomplete;