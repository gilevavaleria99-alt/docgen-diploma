import React from 'react';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { FaCheckCircle, FaSpinner, FaExclamationCircle } from 'react-icons/fa';

// --- Стили ---
const headerStyles = {
  padding: '15px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #e0e0e0',
  backgroundColor: 'white',
  height: '60px', 
  boxSizing: 'border-box'
};

const titleStyles = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#333'
};

const statusStyles = {
  fontSize: '14px',
  color: '#888',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginLeft: '20px'
};

const buttonGroupStyles = {
  display: 'flex',
  gap: '10px'
};

const buttonStyles = {
  padding: '8px 20px',
  fontSize: '14px',
  borderRadius: '20px',
  border: 'none',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};

const primaryButton = { ...buttonStyles, backgroundColor: '#9F2BC2', color: 'white' };
const secondaryButton = { ...buttonStyles, backgroundColor: '#96C22B', color: 'white' };

// --- Компонент ---
export default function Header({ meta, content, saveStatus }) {

  // Функция скачивания (без изменений)
  const handleDownload = async () => {
    try {
      // 1. Генерируем файл на сервере
      const url = 'https://lab-gen.ru/api/generate-docx';
      const requestData = { meta, content };
      
      // Получаем файл как Blob (двоичные данные)
      const response = await axios.post(url, requestData, { responseType: 'blob' });
      const blob = response.data;

      // 2. Формируем красивое имя файла
      // Берем заголовок или "Отчет", и удаляем запрещенные символы (/, \, :, * и т.д.)
      const rawTitle = meta.title || 'Новый отчет';
      const safeTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, '_'); 
      const fileName = `${safeTitle}.docx`;

      // 3. Пробуем открыть окно "Сохранить как" (Только Chrome/Edge)
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
          return; // Если успешно сохранили через окно — выходим
        } catch (err) {
          // Если пользователь нажал "Отмена" в окне выбора — ничего не делаем
          if (err.name === 'AbortError') return;
          // Если другая ошибка — идем к запасному варианту
          console.error('Не удалось открыть диалог сохранения:', err);
        }
      }

      // 4. ЗАПАСНОЙ ВАРИАНТ (обычное скачивание с правильным именем)
      fileDownload(blob, fileName);

    } catch (error) {
      console.error('Ошибка при генерации:', error);
      alert('Ошибка генерации файла.');
    }
  };

  // Вспомогательная функция для иконки статуса
  const renderStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return <><FaSpinner className="icon-spin" /> Сохранение...</>;
      case 'saved':
        return <><FaCheckCircle color="green" /> Все изменения сохранены</>;
      case 'error':
        return <><FaExclamationCircle color="red" /> Ошибка сохранения</>;
      default:
        return null;
    }
  };

  return (
    <div style={headerStyles}>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <span style={titleStyles}>
          {/* Если есть название работы, показываем его, иначе "Новый отчет" */}
          {meta.title || 'НОВЫЙ ОТЧЕТ'}
        </span>
        <span style={statusStyles}>
          {renderStatus()}
        </span>
      </div>

      <div style={buttonGroupStyles}>
        <button style={primaryButton} onClick={() => alert('Предпросмотр скоро будет!')}>Предпросмотр</button>
        <button style={secondaryButton} onClick={handleDownload} className="tour-download">Скачать .docx</button>
      </div>
    </div>
  );
}