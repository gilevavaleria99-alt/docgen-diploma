import React from 'react';
import './Workspace.css'; // 1. Импортируем наш новый CSS-файл
import { FaArrowUp, FaArrowDown, FaTrash } from 'react-icons/fa'; // 2. Импортируем иконки

// 3. Импортируем все наши компоненты для блоков
import ParagraphBlock from './ParagraphBlock';
import HeaderBlock from './HeaderBlock';
import ListBlock from './ListBlock';
import ImageBlock from './ImageBlock';

// Workspace принимает `content` для отображения и `setContent` для его изменения
export default function Workspace({ content, setContent }) {
  
  // --- ЛОГИКА УПРАВЛЕНИЯ БЛОКАМИ ---

  // Функция для УДАЛЕНИЯ блока по его ID
  const handleDeleteBlock = (idToDelete) => {
    setContent(prevContent => prevContent.filter(block => block.id !== idToDelete));
  };

  // Функция для ОБНОВЛЕНИЯ данных внутри блока по его ID
  const handleUpdateBlock = (idToUpdate, newData) => {
    setContent(prevContent => 
      prevContent.map(block => 
        block.id === idToUpdate ? { ...block, data: newData } : block
      )
    );
  };

  const handleMoveBlockUp = (index) => {
    // Не можем двигать самый верхний элемент
    if (index === 0) return; 
    
    // Создаем копию массива, чтобы не изменять состояние напрямую
    const newContent = [...content];
    // Меняем местами текущий элемент (index) и предыдущий (index - 1)
    [newContent[index - 1], newContent[index]] = [newContent[index], newContent[index - 1]];
    // Обновляем состояние
    setContent(newContent);
  };

  const handleMoveBlockDown = (index) => {
    // Не можем двигать самый нижний элемент
    if (index === content.length - 1) return;
    
    const newContent = [...content];
    // Меняем местами текущий элемент (index) и следующий (index + 1)
    [newContent[index], newContent[index + 1]] = [newContent[index + 1], newContent[index]];
    setContent(newContent);
  };

  // Функция для отрисовки КОНКРЕТНОГО блока в зависимости от его типа
  const renderBlock = (block) => {
    switch (block.type) {
      case 'paragraph':
        return <ParagraphBlock data={block.data} onUpdate={(newData) => handleUpdateBlock(block.id, newData)} />;
      case 'header':
        return <HeaderBlock data={block.data} onUpdate={(newData) => handleUpdateBlock(block.id, newData)} />;
      case 'list':
        return <ListBlock data={block.data} onUpdate={(newData) => handleUpdateBlock(block.id, newData)} />;
      case 'image':
        return <ImageBlock data={block.data} onUpdate={(newData) => handleUpdateBlock(block.id, newData)} />;
      default:
        return <div style={{ color: 'red' }}>Неизвестный тип блока: {block.type}</div>;
    }
  };

// ... (импорты и функции без изменений)
  return (
    <div>
      {/* 1. В map теперь нужен не только block, но и его index */}
      {content.map((block, index) => (
        <div key={block.id} className="block-wrapper">
          {renderBlock(block)}
          <div className="block-controls">
            {/* 2. Привязываем новые функции к кнопкам */}
            <button className="control-button" onClick={() => handleMoveBlockDown(index)}>
              <FaArrowDown />
            </button>
            <button className="control-button" onClick={() => handleMoveBlockUp(index)}>
              <FaArrowUp />
            </button>
            <button className="control-button delete-button" onClick={() => handleDeleteBlock(block.id)}>
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}