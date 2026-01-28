import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
// 1. Добавили useLocation для получения данных из меню
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import Toolbar from './Toolbar';
import Workspace from './Workspace';
import MetadataForm from './MetadataForm';
import Header from './Header';

// Этот массив оставим как "аварийный" запасной вариант, если шаблонов нет
const fallbackStructure = [
  { id: uuidv4(), type: 'paragraph', data: { text: 'Цель работы: …' } },
  { id: uuidv4(), type: 'paragraph', data: { text: 'Задание 1: …' } },
  { id: uuidv4(), type: 'paragraph', data: { text: 'Вывод: …' } }
];

function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // <-- Хук для получения данных навигации

  // 2. Получаем шаблон, переданный из Dashboard (если есть)
  const selectedTemplate = location.state?.templateData;

  const [saveStatus, setSaveStatus] = useState('idle');
  
  // 3. Инициализируем мета-данные
  // Если выбрали шаблон с настройками (например, Практическая), берем их.
  // Иначе ставим "ЛАБОРАТОРНАЯ РАБОТА" по умолчанию.
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
  const isFirstLoad = useRef(true);

  // -------------------------------------------------------------------
  // 1. ЗАГРУЗКА ДАННЫХ ПРИ ОТКРЫТИИ
  // -------------------------------------------------------------------
  useEffect(() => {
    const loadReport = async () => {
      if (id === 'new') {
        // --- ЛОГИКА ДЛЯ НОВОГО ОТЧЕТА ---
        
        if (selectedTemplate) {
          // ВАРИАНТ А: Пользователь выбрал шаблон в меню
          
          const contentWithIds = selectedTemplate.content_default.map(block => {
            // 1. Создаем копию данных блока
            const newBlockData = { ...block.data };

            // 2. ИСПРАВЛЕНИЕ: Заменяем текстовые "\n" на реальные переносы строк
            // Это нужно, так как в JSON из базы данных переносы хранятся как символы
            if (newBlockData.text && typeof newBlockData.text === 'string') {
                newBlockData.text = newBlockData.text.replace(/\\n/g, '\n');
            }

            return {
              ...block,
              id: uuidv4(), // Генерируем новый ID
              data: newBlockData // Используем исправленные данные
            };
          });

          setContent(contentWithIds);

          // Если в шаблоне есть настройки (тип работы), применяем их
          if (selectedTemplate.meta_default) {
            setMeta(prev => ({ ...prev, ...selectedTemplate.meta_default }));
          }

        } else {
          // ВАРИАНТ Б: Шаблон не выбран (аварийный)
          setContent(fallbackStructure);
        }
        
        isFirstLoad.current = false;

      } else {
        // --- ЛОГИКА ДЛЯ СУЩЕСТВУЮЩЕГО ОТЧЕТА (ИЗ БАЗЫ) ---
        try {
          const response = await axios.get(`http://localhost:5000/reports/${id}`);
          const data = response.data;

          setMeta(data.meta_data);
          setContent(data.content_data);
          
          isFirstLoad.current = false;
        } catch (error) {
          console.error('Ошибка загрузки:', error);
          alert('Не удалось открыть отчет.');
          navigate('/');
        }
      }
    };

    loadReport();
  }, [id, navigate, selectedTemplate]);


  // -------------------------------------------------------------------
  // 2. АВТОСОХРАНЕНИЕ
  // -------------------------------------------------------------------
  useEffect(() => {
    if (isFirstLoad.current) return;

    setSaveStatus('saving');

    const timerId = setTimeout(async () => {
      try {
        const response = await axios.post('http://localhost:5000/reports', {
          id: id,
          meta: meta,
          content: content
        });

        setSaveStatus('saved');

        if (id === 'new') {
          const newId = response.data.id;
          // Важно: replace: true, чтобы не ломать историю браузера
          // Также передаем state с шаблоном, чтобы при смене URL данные не потерялись
          navigate(`/editor/${newId}`, { replace: true, state: { templateData: selectedTemplate } });
        }

      } catch (error) {
        console.error('Ошибка сохранения:', error);
        setSaveStatus('error');
      }
    }, 2000);

    return () => clearTimeout(timerId);
  
  }, [meta, content, id, navigate, selectedTemplate]);


  // -------------------------------------------------------------------
  // 3. ВСТАВКА (PASTE)
  // -------------------------------------------------------------------
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
              id: uuidv4(),
              type: 'image',
              data: { url: e.target.result, caption: '' }
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


  // -------------------------------------------------------------------
  // 4. СБРОС (RESET)
  // -------------------------------------------------------------------
  const handleResetContent = () => {
    if (window.confirm('Сбросить отчет к начальному шаблону?')) {
        let resetSource = fallbackStructure;

        // Если у нас есть выбранный шаблон, сбрасываем к нему
        if (selectedTemplate && selectedTemplate.content_default) {
            resetSource = selectedTemplate.content_default;
        }

        const resetContent = resetSource.map(block => {
            // При сбросе тоже нужно обработать \n, иначе они вернутся
            const newBlockData = { ...block.data };
            if (newBlockData.text && typeof newBlockData.text === 'string') {
                newBlockData.text = newBlockData.text.replace(/\\n/g, '\n');
            }
            
            return {
                ...block,
                id: uuidv4(),
                data: newBlockData
            };
        });

        setContent(resetContent);
    }
  };

  // -------------------------------------------------------------------
  // СТИЛИ
  // -------------------------------------------------------------------
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