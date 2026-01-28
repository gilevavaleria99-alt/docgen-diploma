import React, { useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const style = {
  position: 'fixed',
  bottom: '30px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#333',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '50px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  zIndex: 2000,
  animation: 'fadeIn 0.3s ease-out'
};

// ВОТ ЗДЕСЬ ВАЖНО: должно быть написано export default
export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Исчезает через 3 секунды
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={style}>
      <FaCheckCircle color="#96C22B" />
      {message}
    </div>
  );
}