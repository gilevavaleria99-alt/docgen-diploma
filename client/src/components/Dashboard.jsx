import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import fileDownload from 'js-file-download';
import { FaPlus, FaInfoCircle, FaFileAlt, FaEllipsisV, FaTrash, FaCopy, FaDownload, FaEye } from 'react-icons/fa';
import logo from '../assets/logo.png'; 

// Импортируем компоненты
import ConfirmationModal from './ConfirmationModal';
import Toast from './Toast';
import TemplateModal from './TemplateModal'; // <-- НОВЫЙ ИМПОРТ

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#F8F9FA',
    color: 'white',
    fontFamily: 'sans-serif'
  },
  header: {
    marginTop: '60px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '30px'
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
    color: '#1E1E20'
  },
  card: {
    backgroundColor: 'white',
    color: 'black',
    width: '1200px',
    borderRadius: '20px',
    padding: '40px',
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    border: '1px solid #797979',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2.5fr 1fr 0.8fr 1.2fr 0.5fr', 
    paddingBottom: '15px',
    borderBottom: '1px solid #797979',
    fontWeight: 'bold',
    color: '#1E1E20',
    fontSize: '14px'
  },
  list: {
    flexGrow: 1,
    marginTop: '10px'
  },
  listItem: {
    display: 'grid',
    gridTemplateColumns: '2.5fr 1fr 0.8fr 1.2fr 0.5fr',
    padding: '15px 0',
    borderBottom: '1px solid #dadadaff',
    alignItems: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'background-color 0.2s',
    position: 'relative'
  },
  buttonsArea: {
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    paddingTop: '30px'
  },
  createBtn: {
    backgroundColor: '#96C22B',
    color: 'white',
    border: 'none',
    padding: '10px 25px',
    borderRadius: '100px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    textDecoration: 'none'
  },
  infoBtn: {
    backgroundColor: '#9F2BC2',
    color: 'white',
    border: 'none',
    padding: '10px 25px',
    borderRadius: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px'
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '10px',
    color: '#999',
    fontSize: '16px',
    display: 'flex',
    justifyContent: 'center'
  },
  dropdown: {
    position: 'absolute',
    right: '30px',
    top: '40px',
    backgroundColor: 'white',
    boxShadow: '0 5px 15px rgba(0,0,0,0.15)',
    borderRadius: '12px',
    padding: '8px 0',
    zIndex: 100,
    minWidth: '180px',
    border: '1px solid #eee'
  },
  dropdownItem: {
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
    transition: 'background 0.1s'
  },
  dropdownItemDelete: {
    color: '#d32f2f'
  }
};

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [templates, setTemplates] = useState([]); // <-- Храним список шаблонов
  const [isLoading, setIsLoading] = useState(true);
  
  // Состояния модалок
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false); // <-- Открыто ли окно выбора
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [modalData, setModalData] = useState({ isOpen: false, id: null, title: '' });
  const [toastMessage, setToastMessage] = useState(null);

  const navigate = useNavigate();

  // --- ЗАГРУЗКА ДАННЫХ (Отчеты + Шаблоны) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // Загружаем параллельно и список работ, и список шаблонов
        const [reportsRes, templatesRes] = await Promise.all([
          axios.get('http://82.146.58.82:5000/reports'),
          axios.get('http://82.146.58.82:5000/templates')
        ]);
        setReports(reportsRes.data);
        setTemplates(templatesRes.data);
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные. Проверьте сервер.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    
    // Закрываем меню при клике в любое место экрана
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleDateString('ru-RU');
  };

  // --- НОВЫЕ ОБРАБОТЧИКИ ---

  // 1. Нажали "Создать новый отчет" -> Открываем модалку выбора шаблона
  const handleCreateClick = () => {
    setIsTemplateModalOpen(true);
  };

  // 2. Выбрали шаблон в модалке -> Переходим в редактор с данными шаблона
  const handleTemplateSelect = (template) => {
    // Закрываем модалку (на всякий случай)
    setIsTemplateModalOpen(false);
    // Переходим на страницу создания, передавая выбранный шаблон в state
    navigate('/editor/new', { state: { templateData: template } });
  };


  // --- СТАРЫЕ ОБРАБОТЧИКИ (Удаление, Дублирование, Скачивание) ---

  const handleDeleteRequest = (id, title) => {
    setActiveMenuId(null);
    setModalData({ isOpen: true, id, title });
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://82.146.58.82:5000/reports/${modalData.id}`);
      setModalData({ ...modalData, isOpen: false });
      // Обновляем список отчетов
      const res = await axios.get('http://82.146.58.82:5000/reports');
      setReports(res.data);
      setToastMessage('Отчет успешно удален');
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  const handleDuplicate = async (id) => {
    setActiveMenuId(null);
    try {
      await axios.post(`http://82.146.58.82:5000/reports/duplicate/${id}`);
      const res = await axios.get('http://82.146.58.82:5000/reports');
      setReports(res.data);
      setToastMessage('Копия отчета создана');
    } catch (error) {
      alert('Ошибка дублирования');
    }
  };

  const handleDownload = async (id) => {
    setActiveMenuId(null);
    try {
      // Получаем данные отчета
      const reportRes = await axios.get(`http://82.146.58.82:5000/reports/${id}`);
      const { meta_data, content_data } = reportRes.data;

      // Генерируем DOCX
      const response = await axios.post('http://82.146.58.82:5000/generate-docx', {
        meta: meta_data,
        content: content_data
      }, { responseType: 'blob' });

      // --- ЛОГИКА ИМЕНИ И СОХРАНЕНИЯ ---
      const blob = response.data;
      const rawTitle = meta_data.title || 'Отчет';
      const safeTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, '_');
      const fileName = `${safeTitle}.docx`;

      // Попытка открыть диалог "Сохранить как"
      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [{
              description: 'Word Document',
              accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
            }],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          setToastMessage('Готово! Отчет сохранен');
          return;
        } catch (err) {
          if (err.name === 'AbortError') return; // Отмена пользователем
        }
      }

      // Фолбэк (обычное скачивание)
      fileDownload(blob, fileName);
      setToastMessage('Готово! Отчет загружен');

    } catch (error) {
      console.error(error);
      alert('Ошибка скачивания');
    }
  };

  const handlePreview = () => {
    setActiveMenuId(null);
    alert('Предпросмотр пока не реализован');
  };

  const handleRowClick = (id) => {
    navigate(`/editor/${id}`);
  };

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
          <span></span> {/* Пустая ячейка для заголовка меню */}
        </div>

        <div style={styles.list}>
          {isLoading ? (
            <div style={{textAlign: 'center', padding: '20px', color: '#999'}}>Загрузка списка...</div>
          ) : reports.length === 0 ? (
            <div style={{textAlign: 'center', padding: '20px', color: '#999'}}>Пока нет сохраненных отчетов</div>
          ) : (
             reports.map(report => (
              <div 
                key={report.id} 
                style={styles.listItem} 
                onClick={() => handleRowClick(report.id)}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <FaFileAlt color="#666" />
                  {report.title}
                </div>
                <div>{report.student_name}</div>
                <div>{report.student_group}</div>
                <div>{formatDate(report.updated_at)}</div>
                
                <div style={{position: 'relative'}} onClick={(e) => e.stopPropagation()}>
                  <button 
                    style={styles.menuBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === report.id ? null : report.id);
                    }}
                  >
                    <FaEllipsisV />
                  </button>

                  {activeMenuId === report.id && (
                    <div style={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                      <div style={styles.dropdownItem} onClick={() => handleDownload(report.id)}>
                        <FaDownload color="#666"/> Скачать
                      </div>
                      <div style={styles.dropdownItem} onClick={handlePreview}>
                        <FaEye color="#666"/> Предпросмотр
                      </div>
                      <div style={styles.dropdownItem} onClick={() => handleDuplicate(report.id)}>
                        <FaCopy color="#666"/> Дублировать
                      </div>
                      <div style={{...styles.dropdownItem, ...styles.dropdownItemDelete}} onClick={() => handleDeleteRequest(report.id, report.title)}>
                        <FaTrash /> Удалить
                      </div>
                    </div>
                  )}
                </div>
              </div>
             ))
          )}
        </div>

        <div style={styles.buttonsArea}>
          {/* ИЗМЕНЕНИЕ: Кнопка открывает модалку, а не переходит сразу */}
          <button 
            onClick={handleCreateClick} 
            style={styles.createBtn}
          >
            <FaPlus /> Создать новый отчет
          </button>
          
          <button style={styles.infoBtn}>
            <FaInfoCircle /> О приложении
          </button>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ВЫБОРА ШАБЛОНА */}
      <TemplateModal 
        isOpen={isTemplateModalOpen} 
        templates={templates} 
        onSelect={handleTemplateSelect}
        onClose={() => setIsTemplateModalOpen(false)}
      />

      {/* МОДАЛЬНОЕ ОКНО УДАЛЕНИЯ */}
      <ConfirmationModal 
        isOpen={modalData.isOpen}
        title="Удаление отчета"
        message={`Вы уверены, что хотите удалить отчет "${modalData.title}"? Это действие необратимо.`}
        onConfirm={confirmDelete}
        onCancel={() => setModalData({...modalData, isOpen: false})}
      />

      {/* УВЕДОМЛЕНИЯ */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}