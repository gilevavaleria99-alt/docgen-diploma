import React, { useState, useEffect, useRef } from 'react';
import './Dropdown.css'; // Стили мы создадим на следующем шаге

export default function Dropdown({ placeholder, options, selected, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Эта логика нужна, чтобы закрывать меню, если кликнуть вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <button className="dropdown-button" onClick={() => setIsOpen(!isOpen)}>
        <span>{selected || placeholder}</span>
        <span className={isOpen ? 'arrow up' : 'arrow down'}></span>
      </button>
      {isOpen && (
        <div className="dropdown-list">
          {options.map(option => (
            <div 
              key={option} 
              className="dropdown-list-item" 
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}