import React, { useState, useRef } from 'react'; // 1. Добавляем 'useRef'
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import './Toolbar.css';
import { FaPlus, FaQuestionCircle, FaSyncAlt, FaArrowLeft } from 'react-icons/fa'; 
import logo from '../assets/logo.png';

export default function Toolbar({ setContent, handleReset, onStartTour }) {
  const [isHeaderOpen, setIsHeaderOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);

  // 2. Создаем "ссылку" на невидимое поле для загрузки файла
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // --- ФУНКЦИИ ДЛЯ ДОБАВЛЕНИЯ БЛОКОВ ---

  const addParagraphBlock = () => {
    setContent(prev => [...prev, { id: uuidv4(), type: 'paragraph', data: { text: '' } }]);
  };

  const addHeaderBlock = (level) => {
    setContent(prev => [...prev, { id: uuidv4(), type: 'header', data: { level: level, text: '' } }]);
    setIsHeaderOpen(false);
  };

  const addListBlock = (style) => {
    setContent(prev => [...prev, { id: uuidv4(), type: 'list', data: { style: style, items: [''] } }]);
    setIsListOpen(false);
  };

  // 3. Функция, которая вызывается, когда пользователь нажимает нашу кнопку "+ Изображение"
  const handleImageButtonClick = () => {
    // Программно "кликаем" по скрытому полю ввода
    fileInputRef.current.click();
  };

  // 4. Функция, которая срабатывает ПОСЛЕ того, как пользователь выбрал файл
  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Получаем выбранный файл
    if (!file) return; // Если пользователь ничего не выбрал, выходим

    const reader = new FileReader(); // Создаем "читателя" файлов
    // Когда "читатель" закончит читать файл...
    reader.onload = (e) => {
      // ...он вернет нам результат в формате Base64 (текстовое представление картинки)
      const base64Image = e.target.result;
      // Добавляем новый блок-изображение в наше состояние
      setContent(prev => [...prev, {
        id: uuidv4(),
        type: 'image',
        data: {
          url: base64Image, // Сохраняем картинку в виде текста
          caption: ''
        }
      }]);
    };
    // Запускаем асинхронное чтение файла
    reader.readAsDataURL(file);
  };

  const handleShowHints = () => {
    if (onStartTour) {
      onStartTour();
    }
  };
  const handleResetAll = () => {
    handleReset();
  };

  const handleBackToMenu = () => {
    navigate('/');
  }

  return (
    <div className="toolbar">
      <div className="toolbar-header">
        <img src={logo} alt="Логотип" className="logo" />
        <span className="toolbar-title">LABGEN</span>
      </div>

      <div className="toolbar-section">
        {/* ... (меню Заголовок без изменений) ... */}
        <div className="dropdown">
          <button className="dropdown-toggle" onClick={() => setIsHeaderOpen(!isHeaderOpen)}>
            Заголовок <span className={isHeaderOpen ? 'arrow up' : 'arrow down'}></span>
          </button>
          {isHeaderOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => addHeaderBlock(1)}>Заголовок 1-го уровня</div>
              <div className="dropdown-item" onClick={() => addHeaderBlock(2)}>Заголовок 2-го уровня</div>
              <div className="dropdown-item" onClick={() => addHeaderBlock(3)}>Заголовок 3-го уровня</div>
            </div>
          )}
        </div>

        <button className="toolbar-button" onClick={addParagraphBlock}>
          <FaPlus className="icon" /> Текст
        </button>

        {/* 5. Привязываем нашу новую функцию к кнопке "+ Изображение" */}
        <button className="toolbar-button" onClick={handleImageButtonClick}>
          <FaPlus className="icon" /> Изображение
        </button>

        {/* ... (меню Список без изменений) ... */}
        <div className="dropdown">
           <button className="dropdown-toggle" onClick={() => setIsListOpen(!isListOpen)}>
             Список <span className={isListOpen ? 'arrow up' : 'arrow down'}></span>
           </button>
           {isListOpen && (
             <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => addListBlock('numbered')}>Нумерованный список</div>
               <div className="dropdown-item" onClick={() => addListBlock('unordered')}>Маркированный список</div>
               <div className="dropdown-item" onClick={() => addListBlock('lettered')}>Буквенный список</div>
             </div>
           )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }} // Делаем его невидимым
          accept="image/png, image/jpeg" // Разрешаем выбирать только картинки
        />
      </div>
      
      <div className="toolbar-footer">
        <button className="footer-button" onClick={handleBackToMenu}>
          <FaArrowLeft className="icon" /> В главное меню
        </button>
         <button className="footer-button" onClick={handleShowHints}>
           <FaQuestionCircle className="icon" /> Включить подсказки
         </button>
         <button className="footer-button" onClick={handleResetAll}>
           <FaSyncAlt className="icon" /> Сбросить всё
         </button>
      </div>
    </div>
  );
}