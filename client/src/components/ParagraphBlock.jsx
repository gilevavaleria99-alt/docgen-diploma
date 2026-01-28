import { useRef, useEffect } from 'react'; // 1. Импортируем useRef и useEffect

export default function ParagraphBlock({ data, onUpdate }) {
  // 2. Создаем "ссылку", которую мы привяжем к нашему текстовому полю
  const textareaRef = useRef(null);

  // 3. Этот код будет выполняться каждый раз, когда меняется текст (data.text)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Сначала сбрасываем высоту
      textarea.style.height = `${textarea.scrollHeight}px`; // Затем устанавливаем высоту равной высоте контента
    }
  }, [data.text]); // Массив зависимостей: код сработает при первой загрузке и при каждом изменении текста

  return (
    <div>
      <div className="block-label">Текст</div>
      <textarea
        ref={textareaRef} // 4. Привязываем нашу "ссылку" к элементу
        value={data.text}
        placeholder="Введите текст отчета"
        onChange={(e) => onUpdate({ ...data, text: e.target.value })}
        className="block-textarea"
        // 5. УДАЛЯЕМ rows={4}, так как высота теперь управляется динамически
      />
    </div>
  );
}