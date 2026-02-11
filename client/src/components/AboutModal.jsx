import React from 'react';
import { FaInfoCircle, FaCode, FaServer, FaDatabase, FaLayerGroup } from 'react-icons/fa';

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000, backdropFilter: 'blur(5px)'
  },
  modal: {
    backgroundColor: 'white', padding: '40px', borderRadius: '24px',
    width: '500px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    position: 'relative', border: '1px solid #eee'
  },
  title: { fontSize: '28px', fontWeight: 'bold', marginBottom: '5px', color: '#1E1E20' },
  subtitle: { fontSize: '14px', color: '#9F2BC2', marginBottom: '30px', fontWeight: '600', letterSpacing: '1px' },
  section: { textAlign: 'left', marginBottom: '20px', backgroundColor: '#F8F9FA', padding: '18px', borderRadius: '16px', border: '1px solid #efefef' },
  label: { fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' },
  techItem: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', fontSize: '15px', color: '#333' },
  button: {
    backgroundColor: '#96C22B', color: 'white', border: 'none',
    padding: '12px 40px', borderRadius: '100px', fontSize: '16px',
    fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', marginTop: '10px'
  }
};

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  
    return (
        <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.title}>LABGEN</div>
            <div style={styles.subtitle}>v1.0</div>
            
            <div style={styles.section}>
            <div style={styles.label}>Автор и разработчик</div>
            {/* Текст стал темнее и жирнее для читаемости */}
            <p style={{margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1E1E20'}}>
                Гилева Валерия Артемовна
            </p>
            <p style={{margin: '8px 0 0 0', fontSize: '14px', color: '#444', fontWeight: '500'}}>
                Студентка группы БИ-41.1
            </p>
            <p style={{margin: '4px 0 0 0', fontSize: '12px', color: '#9F2BC2', fontStyle: 'italic'}}>
                Выпускная квалификационная работа
            </p>
            </div>

            <div style={styles.section}>
            <div style={styles.label}>Технологический стек</div>
            <div style={styles.techItem}><FaCode color="#9F2BC2" /> <b>Frontend:</b> React 18 + Vite</div>
            <div style={styles.techItem}><FaServer color="#9F2BC2" /> <b>Backend:</b> Node.js (Express)</div>
            <div style={styles.techItem}><FaDatabase color="#9F2BC2" /> <b>Database:</b> PostgreSQL 15</div>
            <div style={styles.techItem}><FaLayerGroup color="#9F2BC2" /> <b>Cloud:</b> Ubuntu VPS + Nginx</div>
            </div>

            <button 
            style={styles.button} 
            onClick={onClose}
            >
            Закрыть
            </button>
            
            <div style={{marginTop: '25px', fontSize: '11px', color: '#bbb', letterSpacing: '0.5px'}}>
            © 2026 LABGEN. ВСЕ ПРАВА ЗАЩИЩЕНЫ.
            </div>
        </div>
        </div>
    );
}