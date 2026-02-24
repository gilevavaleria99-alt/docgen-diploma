import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function PreviewModal({ isOpen, onClose, meta, content }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generatePdfPreview();
    } else {
      // Очищаем ссылку при закрытии, чтобы не забивать память
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }, [isOpen]);

  const generatePdfPreview = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://lab-gen.ru/api/generate-pdf', {
        meta, content
      }, { responseType: 'blob' });

      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setPdfUrl(url);
    } catch (error) {
      console.error("PDF Preview Error:", error);
      alert("Ошибка генерации предпросмотра");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 5000,
      display: 'flex', flexDirection: 'column', padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white', display: 'flex', justifyContent: 'space-between',
        padding: '15px 30px', borderRadius: '12px 12px 0 0', alignItems: 'center'
      }}>
        <span style={{fontWeight: 'bold', fontSize: '18px'}}>Эталонный предпросмотр (PDF)</span>
        <button 
          onClick={onClose}
          style={{backgroundColor: '#9F2BC2', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '100px', cursor: 'pointer'}}
        >Закрыть</button>
      </div>

      <div style={{flexGrow: 1, backgroundColor: '#525659', display: 'flex', justifyContent: 'center', position: 'relative'}}>
        {loading && <div style={{color: 'white', marginTop: '100px', fontSize: '20px'}}>Генерация точной копии документа...</div>}
        
        {pdfUrl && (
          <iframe 
            src={`${pdfUrl}#toolbar=0&navpanes=0`} 
            width="100%" 
            height="100%" 
            style={{border: 'none'}}
            title="preview"
          />
        )}
      </div>
    </div>
  );
}