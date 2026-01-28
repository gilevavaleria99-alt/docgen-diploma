export default function ImageBlock({ data, onUpdate }) {
  return (
    <div>
      <div className="block-label">Изображение</div>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        {/* Это серый блок-плейсхолдер, как в макете. Мы будем показывать его, а под ним картинку */}
        <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
          <img 
            src={data.url} 
            alt={data.caption} 
            style={{
              display: 'block', margin: '0 auto', borderRadius: '8px',
              maxWidth: '600px', maxHeight: '350px', width: 'auto', height: 'auto'
            }} 
          />
        </div>
      </div>
      <input
        type="text"
        value={data.caption}
        placeholder="Введите название изображения"
        onChange={(e) => onUpdate({ ...data, caption: e.target.value })}
        className="block-input"
      />
    </div>
  );
}