import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import Toolbar from './Toolbar';
import Workspace from './Workspace';
import MetadataForm from './MetadataForm';
import Header from './Header';
import GuidedTour from './GuidedTour';
import ConfirmationModal from './ConfirmationModal';

// Функция для получения уникального ID этого браузера
const getClientId = () => {
  let clientId = localStorage.getItem('akademik_client_id');
  if (!clientId) {
    clientId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('akademik_client_id', clientId);
  }
  return clientId;
};

// Запасной шаблон (на случай критического сбоя)
const fallbackStructure = [
  { id: uuidv4(), type: 'paragraph', data: { text: 'Цель работы: …' } },
  { id: uuidv4(), type: 'paragraph', data: { text: 'Задание 1: …' } },
  { id: uuidv4(), type: 'paragraph', data: { text: 'Вывод: …' } }
];

// Настройка API URL
const API_URL = 'https://lab-gen.ru/api'; 

function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedTemplate = location.state?.templateData;
  const [saveStatus, setSaveStatus] = useState('idle');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  // СОСТОЯНИЕ ДЛЯ ПОДСКАЗОК
  const [runTour, setRunTour] = useState(false); 

  const currentIdRef = useRef(id);
  const isFirstLoad = useRef(true);
  
  // Реф для хранения исходного контента для сброса
  const initialContentRef = useRef([]);

  const [meta, setMeta] = useState({
    reportType: selectedTemplate?.meta_default?.reportType || 'ЛАБОРАТОРНАЯ РАБОТА',
    workNumber: '',
    title: '',
    studentName: '',
    studentGroup: '',
    supervisorTitle: '',
    supervisorName: '',
    year: new Date().getFullYear().toString(),
  });

  const [content, setContent] = useState([]);

  useEffect(() => {
    currentIdRef.current = id;
  }, [id]);

  // ЗАГРУЗКА ДАННЫХ
  useEffect(() => {
    const loadReport = async () => {
      isFirstLoad.current = true; 

      if (id === 'new') {
        if (selectedTemplate) {
          formatContent(selectedTemplate.content_default);
          
          setContent(contentWithIds);
          initialContentRef.current = contentWithIds; // Запоминаем для сброса

          if (selectedTemplate.meta_default) {
            setMeta(prev => ({ ...prev, ...selectedTemplate.meta_default }));
          }
        } else {
          setContent(fallbackStructure);
          initialContentRef.current = fallbackStructure;
        }
        setTimeout(() => { isFirstLoad.current = false; }, 1000);
      } else {
        try {
          const response = await axios.get(`${API_URL}/reports/${id}`);
          const data = response.data;
          setMeta(data.meta_data);
          setContent(data.content_data);
          
          // Для существующих отчетов "сброс" - это возврат к тому виду, 
          // в котором отчет был открыт в начале этой сессии
          initialContentRef.current = data.content_data; 

          setTimeout(() => { isFirstLoad.current = false; }, 1000);
        } catch (error) {
          console.error('Ошибка загрузки:', error);
          alert('Не удалось открыть отчет.');
          navigate('/');
        }
      }
    };
    loadReport();
  }, [id, selectedTemplate, navigate]);


  // АВТОСОХРАНЕНИЕ
  useEffect(() => {
    if (isFirstLoad.current) return;
    setSaveStatus('saving');
    const timerId = setTimeout(async () => {
      try {
        const idToSave = currentIdRef.current;
        const response = await axios.post(`${API_URL}/reports`, {
          id: idToSave,
          meta: meta,
          content: content,
          clientId: getClientId()
        });
        setSaveStatus('saved');
        if (idToSave === 'new') {
          const newId = response.data.id;
          currentIdRef.current = newId;
          navigate(`/editor/${newId}`, { replace: true });
        }
      } catch (error) {
        console.error('Ошибка сохранения:', error);
        setSaveStatus('error');
      }
    }, 2000);
    return () => clearTimeout(timerId);
  }, [meta, content, navigate]);


  // PASTE
  useEffect(() => {
    const handlePaste = (event) => {
      const clipboardItems = event.clipboardData.items;
      for (const item of clipboardItems) {
        if (item.type.indexOf('image') !== -1) {
          event.preventDefault();
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (e) => {
            setContent(prev => [...prev, {
              id: uuidv4(), type: 'image', data: { url: e.target.result, caption: '' }
            }]);
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleResetContent = () => {
    setIsResetModalOpen(true);
  };

  const formatContent = (contentArray) => {
    return contentArray.map(block => {
      const newBlockData = { ...block.data };
      // Исправляем технические переносы строк на настоящие
      if (newBlockData.text && typeof newBlockData.text === 'string') {
        newBlockData.text = newBlockData.text.replace(/\\n/g, '\n');
      }
      return { ...block, id: uuidv4(), data: newBlockData };
    });
  };

  const confirmReset = () => {
    if (selectedTemplate && selectedTemplate.content_default) {
      // Создаем глубокую копию и новые ID, чтобы React обновил компоненты
      const resetContent = formatContent(selectedTemplate.content_default);
      setContent(resetContent);
    } else if (initialContentRef.current && initialContentRef.current.length > 0) {
      setContent(initialContentRef.current.map(block => ({
        ...block,
        id: uuidv4()
      })));
    }
    setIsResetModalOpen(false);
  }

  // СТИЛИ 
  const appStyles = { display: 'flex', fontFamily: 'sans-serif', height: '100vh', width: '100vw', backgroundColor: '#F8F9FA', overflow: 'hidden'};
  const toolbarContainerStyles = { width: '250px', flexShrink: 0, borderRight: '1px solid #e0e0e0' };
  const mainContentStyles = { flexGrow: 1, display: 'flex', flexDirection: 'column' };
  const workspaceContainerStyles = { flexGrow: 1, padding: '20px', overflowY: 'auto', height: 'calc(100vh - 60px)'};
  const metadataStyles = { width: '350px', flexShrink: 0, padding: '20px', borderLeft: '1px solid #e0e0e0', backgroundColor: 'white', position: 'relative', zIndex: 5, height: '100vh', overflowY: 'auto' };

  return (
    <div style={appStyles}>
      <div style={toolbarContainerStyles} className="tour-toolbar">
        <Toolbar 
          setContent={setContent} 
          handleReset={handleResetContent} 
          onStartTour={() => setRunTour(true)} 
        />
      </div>

      <div style={mainContentStyles}>
        <Header meta={meta} content={content} saveStatus={saveStatus} />
        
        <div style={workspaceContainerStyles} className="tour-workspace">
          <Workspace content={content} setContent={setContent} />
        </div>
      </div>

      <div style={metadataStyles} className="tour-metadata">
        <MetadataForm meta={meta} setMeta={setMeta} />
      </div>

      <GuidedTour run={runTour} setRun={setRunTour} />
      
      <ConfirmationModal 
        isOpen={isResetModalOpen} 
        title="Сброс изменений" 
        message="Вы уверены, что хотите сбросить отчет к начальному шаблону? Все внесенные правки будут удалены." 
        onConfirm={confirmReset} 
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}

export default EditorPage;