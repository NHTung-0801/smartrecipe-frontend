import { useState, useEffect, useRef } from 'react';
import s from './UnitAutocomplete.module.css';

const UNIT_GROUPS = [
  {
    label: 'Khối lượng',
    options: ['g (gram)', 'kg']
  },
  {
    label: 'Thể tích',
    options: ['ml', 'lít']
  },
  {
    label: 'Đếm được',
    options: ['quả/trái', 'củ', 'tép', 'bó', 'con', 'lát', 'nhánh']
  },
  {
    label: 'Đong đếm',
    options: ['thìa cafe (tsp)', 'thìa canh (tbsp)', 'chén/bát', 'hộp', 'lon', 'gói', 'túi']
  }
];

export default function UnitAutocomplete({ value, onChange, placeholder = 'Đơn vị' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const wrapperRef = useRef(null);

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

  // Không cần filteredUnits nữa vì ta chỉ hiện fixed list

  const handleSelect = (unit) => {
    setQuery(unit);
    onChange(unit);
    setIsOpen(false);
  };

  const handleChange = (e) => {
    // Không cho phép gõ trực tiếp nữa, chỉ dùng để đọc
  };

  return (
    <div className={`${s.wrapper} ${isOpen ? s.active : ''}`} ref={wrapperRef}>
      <input
        type="text"
        className={s.input}
        value={query}
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        placeholder={placeholder}
      />
      
      {isOpen && (
        <div className={s.dropdownWrapper}>
          <ul className={s.dropdown}>
            {UNIT_GROUPS.map((group) => (
              <li key={group.label} className={s.group}>
                <div className={s.groupLabel}>{group.label}</div>
                <ul className={s.groupList}>
                  {group.options.map((unit) => (
                    <li
                      key={unit}
                      className={`${s.option} ${query === unit ? s.selected : ''}`}
                      onClick={() => handleSelect(unit)}
                    >
                      {unit}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
