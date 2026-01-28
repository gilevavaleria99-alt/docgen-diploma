import React from 'react';
import { FaFileAlt } from 'react-icons/fa';

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 2000,
    backdropFilter: 'blur(3px)' // Красивое размытие фона
  },
  modal: {
    backgroundColor: 'white',
    width: '600px',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '80vh'
  },
  header: {
    fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', 
    color: '#333', textAlign: 'center'
  },
  list: {
    overflowY: 'auto',
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px',
    marginBottom: '20px',
    padding: '10px'
  },
  card: {
    border: '1px solid #eee',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: '15px',
    backgroundColor: '#F8F9FA'
  },
  cardHover: {
    borderColor: '#96C22B',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 10px rgba(150, 194, 43, 0.2)'
  },
  title: { fontWeight: 'bold', fontSize: '16px', color: '#333' },
  desc: { fontSize: '13px', color: '#666', marginTop: '4px' },
  closeBtn: {
    alignSelf: 'center',
    background: 'none', border: 'none', color: '#999',
    cursor: 'pointer', fontSize: '14px', textDecoration: 'underline'
  }
};

export default function TemplateModal({ isOpen, templates, onSelect, onClose }) {
  const [hoverId, setHoverId] = React.useState(null);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>Выберите тип работы</div>
        
        <div style={styles.list}>
          {templates.map(tpl => (
            <div 
              key={tpl.id}
              style={{
                ...styles.card,
                ...(hoverId === tpl.id ? styles.cardHover : {})
              }}
              onMouseEnter={() => setHoverId(tpl.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => onSelect(tpl)}
            >
              <div style={{ color: hoverId === tpl.id ? '#96C22B' : '#ccc', fontSize: '24px' }}>
                <FaFileAlt />
              </div>
              <div>
                <div style={styles.title}>{tpl.name}</div>
                <div style={styles.desc}>{tpl.description}</div>
              </div>
            </div>
          ))}
        </div>

        <button style={styles.closeBtn} onClick={onClose}>
          Отмена
        </button>
      </div>
    </div>
  );
}