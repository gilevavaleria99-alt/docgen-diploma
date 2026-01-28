import React from 'react';
import './MetadataForm.css';

// --- КОМПОНЕНТ ДЛЯ ПОЛЯ ВВОДА ---
// Мы оставим его здесь, так как он используется только в этой форме
const InputField = ({ placeholder, name, value, onChange }) => (
  <div className="form-field-wrapper">
    <input
      type="text"
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      className="form-input"
    />
  </div>
);


// --- ГЛАВНЫЙ КОМПОНЕНТ ФОРМЫ ---
// Вот та самая строка, которая была удалена
export default function MetadataForm({ meta, setMeta }) {

  // Эта функция нужна для работы полей ввода
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setMeta(prevMeta => ({
      ...prevMeta,
      [name]: value
    }));
  };

  // Теперь 'return' находится ВНУТРИ функции, как и положено
  return (
    <div className="metadata-form">
      <h2 className="metadata-title">Титульный лист отчета</h2>

      <InputField placeholder="Номер работы (напр. 1)" name="workNumber" value={meta.workNumber} onChange={handleInputChange} />
      <InputField placeholder="Название работы" name="title" value={meta.title} onChange={handleInputChange} />
      <InputField placeholder="Фамилия И. О. (студента)" name="studentName" value={meta.studentName} onChange={handleInputChange} />
      <InputField placeholder="Группа" name="studentGroup" value={meta.studentGroup} onChange={handleInputChange} />
      <InputField placeholder="Должность преподавателя" name="supervisorTitle" value={meta.supervisorTitle} onChange={handleInputChange} />
      <InputField placeholder="Фамилия И. О. (преподавателя)" name="supervisorName" value={meta.supervisorName} onChange={handleInputChange} />
      <InputField placeholder="Год" name="year" value={meta.year} onChange={handleInputChange} />
    </div>
  );
}