export default function HeaderBlock({ data, onUpdate }) {
  return (
    <div>
      <div className="block-label">Заголовок {data.level}-го уровня</div>
      <input
        type="text"
        value={data.text}
        placeholder="Введите название заголовка"
        onChange={(e) => onUpdate({ ...data, text: e.target.value })}
        className="block-input" // Используем стандартный класс для инпута
      />
    </div>
  );
}