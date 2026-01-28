import React from 'react';

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Затемнение
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '20px', // Твои скругления
    width: '400px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
  },
  title: { fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#333' },
  text: { marginBottom: '25px', color: '#666', lineHeight: '1.5' },
  buttonGroup: { display: 'flex', justifyContent: 'center', gap: '15px' },
  button: {
    padding: '12px 30px', borderRadius: '50px', border: 'none',
    fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s'
  },
  // Твои цвета:
  btnPrimary: { backgroundColor: '#9F2BC2', color: 'white' }, // Фиолетовый (Удалить)
  btnSecondary: { backgroundColor: '#96C22B', color: 'white' } // Зеленый (Отмена)
};

export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.title}>{title}</div>
        <div style={styles.text}>{message}</div>
        <div style={styles.buttonGroup}>
          <button style={{...styles.button, ...styles.btnSecondary}} onClick={onCancel}>
            Отмена
          </button>
          <button style={{...styles.button, ...styles.btnPrimary}} onClick={onConfirm}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}