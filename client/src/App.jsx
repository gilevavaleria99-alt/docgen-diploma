import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import EditorPage from './components/EditorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Главная страница - Дашборд */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Страница редактора. 
            :id означает, что сюда можно передать "new" или ID существующего отчета */}
        <Route path="/editor/:id" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;