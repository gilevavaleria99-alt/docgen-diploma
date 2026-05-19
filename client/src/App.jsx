import React, { useState, useEffect } from 'react';
import { FaDesktop } from 'react-icons/fa';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import EditorPage from './components/EditorPage';

function App() {
  // 1. Создаем состояние для отслеживания ширины экрана
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 2. Добавляем слушатель изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    
    // Очищаем слушатель при размонтировании
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. Если устройство мобильное - возвращаем экран-заглушку
  if (isMobile) {
    return (
      <div style={{
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh', 
        backgroundColor: '#F8F9FA', 
        padding: '30px', 
        textAlign: 'center',
        fontFamily: 'sans-serif', 
        color: '#1E1E20'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px 20px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          maxWidth: '400px'
        }}>
          <FaDesktop style={{ fontSize: '60px', color: '#9F2BC2', marginBottom: '20px' }} />
          <h1 style={{ fontSize: '24px', marginBottom: '15px', fontWeight: 'bold' }}>
            Доступно только на ПК
          </h1>
          <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', margin: 0 }}>
            LABGEN — это профессиональный инструмент для создания академических отчетов. <br/><br/>
            Для обеспечения корректной работы визуального конструктора и соблюдения стандартов ГОСТ, пожалуйста, <b>откройте сервис на компьютере или планшете</b>.
          </p>
        </div>
      </div>
    );
  }

  // 4. Если устройство десктопное (или планшет > 768px) - возвращаем основной роутинг
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/editor/:id" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;