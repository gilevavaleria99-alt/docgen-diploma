import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import fileDownload from 'js-file-download';
import { FaPlus, FaInfoCircle, FaFileAlt, FaEllipsisV, FaTrash, FaCopy, FaDownload, FaEye } from 'react-icons/fa';
import logo from '../assets/logo.png'; 

import ConfirmationModal from './ConfirmationModal';
import Toast from './Toast';
import TemplateModal from './TemplateModal';

const getClientId = () => {
  let clientId = localStorage.getItem('akademik_client_id');
  if (!clientId) {
    clientId = Math.random().toString(36).substring(2, 15); // Создаем случайный ID
    localStorage.setItem('akademik_client_id', clientId);
  }
  return clientId;
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F8F9FA', color: 'white', fontFamily: 'sans-serif' },
  header: { marginTop: '60px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' },
  headerTitle: { fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1E1E20' },
  card: { backgroundColor: 'white', color: 'black', width: '1200px', borderRadius: '20px', padding: '40px', minHeight: '500px', display: 'flex', flexDirection: 'column', position: 'relative', border: '1px solid #797979', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
  tableHeader: { display: 'grid', gridTemplateColumns: '2.5fr 1fr 0.8fr 1.2fr 0.5fr', paddingBottom: '15px', borderBottom: '1px solid #797979', fontWeight: 'bold', color: '#1E1E20', fontSize: '14px' },
  list: { flexGrow: 1, marginTop: '10px' },
  listItem: { display: 'grid', gridTemplateColumns: '2.5fr 1fr 0.8fr 1.2fr 0.5fr', padding: '15px 0', borderBottom: '1px solid #dadadaff', alignItems: 'center', cursor: 'pointer', textDecoration: 'none', color: 'inherit', transition: 'background-color 0.2s', position: 'relative' },
  buttonsArea: { marginTop: 'auto', display: 'flex', justifyContent: 'center', gap: '20px', paddingTop: '30px' },
  createBtn: { backgroundColor: '#96C22B', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', textDecoration: 'none' },
  infoBtn: { backgroundColor: '#9F2BC2', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' },
  menuBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '10px', color: '#999', fontSize: '16px', display: 'flex', justifyContent: 'center' },
  dropdown: { position: 'absolute', right: '30px', top: '40px', backgroundColor: 'white', boxShadow: '0 5px 15px rgba(0,0,0,0.15)', borderRadius: '12px', padding: '8px 0', zIndex: 100, minWidth: '180px', border: '1px solid #eee' },
  dropdownItem: { padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#333', transition: 'background 0.1s' },
  dropdownItemDelete: { color: '#d32f2f' }
};

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [modalData, setModalData] = useState({ isOpen: false, id: null, title: '' });
  const [toastMessage, setToastMessage] = useState(null);

  const navigate = useNavigate();

  // --- 1. ФУНКЦИЯ ПОЛУЧЕНИЯ ID КЛИЕНТА (ПАСПОРТ) ---
  const getClientId = () => {
    let id = localStorage.getItem('akademik_client_id');
    if (!id) {
      // Генерируем случайный ID, если его нет
      id = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('akademik_client_id', id);
    }
    return id;
  };

  // --- ЗАГРУЗКА ДАННЫХ ---
  const fetchReports = async () => {
  try {
    const clientId = getClientId(); // Получаем наш ID
    // ВАЖНО: добавляем ?clientId=... в конец адреса
    const response = await axios.get(`https://lab-gen.ru:5000/reports?clientId=${clientId}`);
    setReports(response.data);
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    const loadData = async () => {
      try {
        const clientId = getClientId();

        // Загружаем отчеты (с ID) и шаблоны (общие)
        // ВАЖНО: Используем localhost для тестов в этой ветке
        const [reportsRes, templatesRes] = await Promise.all([
          axios.get('https://lab-gen.ru:5000/reports', { params: { clientId } }),
          axios.get('https://lab-gen.ru:5000/templates')
        ]);
        setReports(reportsRes.data);
        setTemplates(templatesRes.data);
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные (локальный сервер).');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleDateString('ru-RU');
  };

  // --- ОБРАБОТЧИКИ ---

  const handleCreateClick = () => setIsTemplateModalOpen(true);

  const handleTemplateSelect = (template) => {
    setIsTemplateModalOpen(false);
    navigate('/editor/new', { state: { templateData: template } });
  };

  const handleDeleteRequest = (id, title) => {
    setActiveMenuId(null);
    setModalData({ isOpen: true, id, title });
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`https://lab-gen.ru:5000/reports/${modalData.id}`);
      setModalData({ ...modalData, isOpen: false });
      fetchReports(); // Обновляем список после удаления
      setToastMessage('Отчет успешно удален');
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  const handleDuplicate = async (id) => {
    setActiveMenuId(null);
    try {
      await axios.post(`https://lab-gen.ru:5000/reports/duplicate/${id}`);
      fetchReports(); // Обновляем список после дублирования
      setToastMessage('Копия отчета создана');
    } catch (error) {
      alert('Ошибка дублирования');
    }
  };

  const handleDownload = async (id) => {
    setActiveMenuId(null);
    try {
      const reportRes = await axios.get(`https://lab-gen.ru:5000/reports/${id}`);
      const { meta_data, content_data } = reportRes.data;

      const response = await axios.post('https://lab-gen.ru:5000/generate-docx', {
        meta: meta_data,
        content: content_data
      }, { responseType: 'blob' });

      const blob = response.data;
      const rawTitle = meta_data.title || 'Отчет';
      const safeTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, '_');
      const fileName = `${safeTitle}.docx`;

      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [{ description: 'Word Document', accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } }],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          setToastMessage('Готово! Отчет сохранен');
          return;
        } catch (err) { if (err.name === 'AbortError') return; }
      }

      fileDownload(blob, fileName);
      setToastMessage('Готово! Отчет загружен');

    } catch (error) {
      console.error(error);
      alert('Ошибка скачивания');
    }
  };

  const handlePreview = () => { setActiveMenuId(null); alert('Предпросмотр пока не реализован'); };
  const handleRowClick = (id) => { navigate(`/editor/${id}`); };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img src={logo} alt="Logo" style={{width: 40}} />
        <h1 style={styles.headerTitle}>Добро пожаловать в LABGEN!</h1>
      </div>

      <div style={styles.card}>
        <div style={styles.tableHeader}>
          <span>Название работы</span>
          <span>ФИО</span>
          <span>Группа</span>
          <span>Последнее обновление</span>
          <span></span>
        </div>

        <div style={styles.list}>
          {isLoading ? (
            <div style={{textAlign: 'center', padding: '20px', color: '#999'}}>Загрузка списка...</div>
          ) : reports.length === 0 ? (
            <div style={{textAlign: 'center', padding: '20px', color: '#999'}}>Пока нет сохраненных отчетов</div>
          ) : (
             reports.map(report => (
              <div key={report.id} style={styles.listItem} onClick={() => handleRowClick(report.id)}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <FaFileAlt color="#666" />
                  {report.title}
                </div>
                <div>{report.student_name}</div>
                <div>{report.student_group}</div>
                <div>{formatDate(report.updated_at)}</div>
                
                <div style={{position: 'relative'}} onClick={(e) => e.stopPropagation()}>
                  <button style={styles.menuBtn} onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === report.id ? null : report.id); }}>
                    <FaEllipsisV />
                  </button>

                  {activeMenuId === report.id && (
                    <div style={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                      <div style={styles.dropdownItem} onClick={() => handleDownload(report.id)}> <FaDownload color="#666"/> Скачать </div>
                      <div style={styles.dropdownItem} onClick={handlePreview}> <FaEye color="#666"/> Предпросмотр </div>
                      <div style={styles.dropdownItem} onClick={() => handleDuplicate(report.id)}> <FaCopy color="#666"/> Дублировать </div>
                      <div style={{...styles.dropdownItem, ...styles.dropdownItemDelete}} onClick={() => handleDeleteRequest(report.id, report.title)}> <FaTrash /> Удалить </div>
                    </div>
                  )}
                </div>
              </div>
             ))
          )}
        </div>

        <div style={styles.buttonsArea}>
          <button onClick={handleCreateClick} style={styles.createBtn}> <FaPlus /> Создать новый отчет </button>
          <button style={styles.infoBtn}> <FaInfoCircle /> О приложении </button>
        </div>
      </div>

      <TemplateModal isOpen={isTemplateModalOpen} templates={templates} onSelect={handleTemplateSelect} onClose={() => setIsTemplateModalOpen(false)} />
      <ConfirmationModal isOpen={modalData.isOpen} title="Удаление отчета" message={`Вы уверены, что хотите удалить отчет "${modalData.title}"?`} onConfirm={confirmDelete} onCancel={() => setModalData({...modalData, isOpen: false})} />
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}