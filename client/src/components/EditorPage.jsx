import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import Toolbar from './Toolbar';
import Workspace from './Workspace';
import MetadataForm from './MetadataForm';
import Header from './Header';

// Функция для получения уникального ID этого браузера
const getClientId = () => {
  let clientId = localStorage.getItem('akademik_client_id');
  if (!clientId) {
    clientId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('akademik_client_id', clientId);
  }
  return clientId;ы
};

// Запасной шаблон
const fallbackStructure = [
  { id: uuidv4(), type: 'paragraph', data: { text: 'Цель работы: …' } },
  { id: uuidv4(), type: 'paragraph', data: { text: 'Задание 1: …' } },
  { id: uuidv4(), type: 'paragraph', data: { text: 'Вывод: …' } }
];

// Настройка API URL
const API_URL = 'https://lab-gen.ru:5000'; 

function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedTemplate = location.state?.templateData;
  const [saveStatus, setSaveStatus] = useState('idle');
  
  // 1. Используем Ref для мгновенного отслеживания ID без перерисовок
  const currentIdRef = useRef(id);
  const isFirstLoad = useRef(true);

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

  // Синхронизируем Ref с URL при переходе между отчетами
  useEffect(() => {
    currentIdRef.current = id;
  }, [id]);

  // 2. ЗАГРУЗКА ДАННЫХ
  useEffect(() => {
    const loadReport = async () => {
      // Блокируем автосохранение на время загрузки
      isFirstLoad.current = true; 

      if (id === 'new') {
        if (selectedTemplate) {
          const contentWithIds = selectedTemplate.content_default.map(block => {
            const newBlockData = { ...block.data };
            if (newBlockData.text && typeof newBlockData.text === 'string') {
                newBlockData.text = newBlockData.text.replace(/\\n/g, '\n');
            }
            return { ...block, id: uuidv4(), data: newBlockData };
          });
          setContent(contentWithIds);
          if (selectedTemplate.meta_default) {
            setMeta(prev => ({ ...prev, ...selectedTemplate.meta_default }));
          }
        } else {
          setContent(fallbackStructure);
        }
        // Даем небольшую задержку, чтобы React успел отрисовать шаблон, 
        // прежде чем разрешить автосохранение
        setTimeout(() => { isFirstLoad.current = false; }, 1000);
      } else {
        try {
          const response = await axios.get(`${API_URL}/reports/${id}`);
          const data = response.data;
          setMeta(data.meta_data);
          setContent(data.content_data);
          setTimeout(() => { isFirstLoad.current = false; }, 1000);
        } catch (error) {
          console.error('Ошибка загрузки:', error);
          alert('Не удалось открыть отчет.');
          navigate('/');
        }
      }
    };
    loadReport();
  }, [id, selectedTemplate]); // Убрали лишние зависимости


  // 3. АВТОСОХРАНЕНИЕ
  useEffect(() => {
    if (isFirstLoad.current) return;

    setSaveStatus('saving');

    const timerId = setTimeout(async () => {
      try {
        // Берем актуальный ID из Ref (это может быть 'new' или число)
        const idToSave = currentIdRef.current;

        const response = await axios.post(`${API_URL}/reports`, {
          id: idToSave,
          meta: meta,
          content: content,
          clientId: getClientId()
        });

        setSaveStatus('saved');
        
        // Если это было первое сохранение нового отчета
        if (idToSave === 'new') {
          const newId = response.data.id;
          currentIdRef.current = newId; // Сразу обновляем Ref, чтобы не было дублей
          navigate(`/editor/${newId}`, { replace: true });
        }
      } catch (error) {
        console.error('Ошибка сохранения:', error);
        setSaveStatus('error');
      }
    }, 2000);

    return () => clearTimeout(timerId);
  }, [meta, content]); // Следим только за изменениями данных


  // 4. PASTE И RESET 
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
    if (window.confirm('Сбросить отчет к начальному шаблону?')) {
        let resetSource = selectedTemplate?.content_default || fallbackStructure;
        const resetContent = resetSource.map(block => {
            const newBlockData = { ...block.data };
            if (newBlockData.text && typeof newBlockData.text === 'string') {
                newBlockData.text = newBlockData.text.replace(/\\n/g, '\n');
            }
            return { ...block, id: uuidv4(), data: newBlockData };
        });
        setContent(resetContent);
    }
  };

  // СТИЛИ 
  const appStyles = { display: 'flex', fontFamily: 'sans-serif', height: '100vh', backgroundColor: '#F8F9FA' };
  const toolbarContainerStyles = { width: '250px', flexShrink: 0, borderRight: '1px solid #e0e0e0' };
  const mainContentStyles = { flexGrow: 1, display: 'flex', flexDirection: 'column' };
  const workspaceContainerStyles = { flexGrow: 1, padding: '20px', overflowY: 'auto' };
  const metadataStyles = { width: '350px', flexShrink: 0, padding: '20px', borderLeft: '1px solid #e0e0e0', backgroundColor: 'white', position: 'relative', zIndex: 5 };

  return (
    <div style={appStyles}>
      <div style={toolbarContainerStyles}>
        <Toolbar setContent={setContent} handleReset={handleResetContent} />
      </div>
      <div style={mainContentStyles}>
        <Header meta={meta} content={content} saveStatus={saveStatus} />
        <div style={workspaceContainerStyles}>
          <Workspace content={content} setContent={setContent} />
        </div>
      </div>
      <div style={metadataStyles}>
        <MetadataForm meta={meta} setMeta={setMeta} />
      </div>
    </div>
  );
}

export default EditorPage;