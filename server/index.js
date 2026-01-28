// 1. Подключаем библиотеки
const express = require('express');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');
const ImageModule = require('docxtemplater-image-module-free');
const angularParser = require("docxtemplater/expressions.js");
const { Pool } = require('pg');

// 2. Настройки подключения к базе
const pool = new Pool({
  user: 'postgres',
  password: '24092025', // Твой пароль
  host: 'localhost',
  port: 5432,
  database: 'akademik_db'
});

// 3. Настраиваем приложение
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const PORT = 5000;

// 4. CORS (Разрешаем фронтенду общаться с сервером)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE'); // Важно: добавили DELETE
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  next();
});

// ================= МАРШРУТЫ БАЗЫ ДАННЫХ =================

// 1. Получить список всех отчетов
app.get('/reports', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reports ORDER BY updated_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения списка:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// --- МАРШРУТ: ПОЛУЧИТЬ СПИСОК ШАБЛОНОВ ---
app.get('/templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM templates ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения шаблонов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// 2. Получить один отчет по ID
app.get('/reports/:id', async (req, res) => {
  const { id } = req.params;
  if (id === 'new') return res.json(null);

  try {
    const result = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Отчет не найден' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка загрузки отчета:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// 3. Сохранить отчет (Создать или Обновить)
app.post('/reports', async (req, res) => {
  const { id, meta, content } = req.body;
  
  // Защита от пустых полей
  const title = meta.title || 'Новый отчет';
  const student_name = meta.studentName || '';
  const student_group = meta.studentGroup || '';

  try {
    let result;
    if (id === 'new') {
      // Создаем новый
      result = await pool.query(
        `INSERT INTO reports (title, student_name, student_group, meta_data, content_data)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [title, student_name, student_group, meta, JSON.stringify(content)]
      );
    } else {
      // Обновляем существующий
      result = await pool.query(
        `UPDATE reports 
         SET title = $1, student_name = $2, student_group = $3, meta_data = $4, content_data = $5, updated_at = NOW()
         WHERE id = $6 RETURNING id`,
        [title, student_name, student_group, meta, JSON.stringify(content), id]
      );
    }
    res.json({ id: result.rows[0].id, message: 'Успешно сохранено' });
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// 4. УДАЛИТЬ ОТЧЕТ
app.delete('/reports/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM reports WHERE id = $1', [id]);
    res.json({ message: 'Отчет удален' });
  } catch (error) {
    console.error('Ошибка удаления:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// 5. ДУБЛИРОВАТЬ ОТЧЕТ (Исправленная версия)
app.post('/reports/duplicate/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Получаем оригинал
    const original = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
    if (original.rows.length === 0) return res.status(404).json({ message: 'Отчет не найден' });
    
    const report = original.rows[0];
    const newTitle = `${report.title} - Копия`;
    
    // Копируем мету и меняем заголовок
    const newMetaData = { ...(report.meta_data || {}), title: newTitle };

    // Вставляем копию
    // ВАЖНО: report.content_data уже объект (Postgres сам распарсил JSON), 
    // поэтому мы снова превращаем его в строку через JSON.stringify, чтобы вставить корректно.
    await pool.query(
      `INSERT INTO reports (title, student_name, student_group, meta_data, content_data)
       VALUES ($1, $2, $3, $4, $5)`,
      [newTitle, report.student_name, report.student_group, newMetaData, JSON.stringify(report.content_data)]
    );

    res.json({ message: 'Отчет дублирован' });
  } catch (error) {
    console.error('Ошибка дублирования:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// ================= ГЕНЕРАЦИЯ DOCX =================

app.post('/generate-docx', (req, res) => {
  try {
    const data = req.body;

    // ЗАЩИТА ОТ ПУСТОГО ОТЧЕТА (чтобы сервер не падал)
    if (!data.content || !Array.isArray(data.content)) {
        data.content = [];
    }

    const templateContent = fs.readFileSync(path.resolve(__dirname, 'template.docx'), 'binary');
    const zip = new PizZip(templateContent);

    const imageOpts = {
      centered: false,
      getImage: (tag) => {
        const base64Data = tag.split(",").pop();
        return Buffer.from(base64Data, 'base64');
      },
      getSize: () => [500, 300],
    };
    
    const imageModule = new ImageModule(imageOpts);
    
    const doc = new Docxtemplater(zip, {
      modules: [imageModule],
      paragraphLoop: true,
      linebreaks: true,
      parser: angularParser
    });

    const russianAlphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';

    const flattenedContent = data.content.map(block => {
      const baseBlock = {
        isHeader: false, isParagraph: false, isList: false, isImage: false,
      };

      switch (block.type) {
        case 'header':
          return { ...baseBlock, isHeader: true, ...block.data };
        case 'paragraph':
          return { ...baseBlock, isParagraph: true, ...block.data };
        case 'image':
          return { ...baseBlock, isImage: true, ...block.data };
        case 'list': { 
            const { style, items } = block.data;
            if (style === 'lettered') {
                const letteredItems = items.map((itemText, index) => ({
                    letter: russianAlphabet[index] || '',
                    text: itemText,
                }));
                return { ...baseBlock, isList: true, ...block.data, items: letteredItems };
            } 
            if (style === 'numbered') {
                const numberedItems = items.map((itemText, index) => ({
                    number: index + 1,
                    text: itemText,
                }));
                return { ...baseBlock, isList: true, ...block.data, items: numberedItems };
            }
            return { ...baseBlock, isList: true, ...block.data };
        }
        default:
          return baseBlock;
      }
    });

    const renderData = {
      ...data.meta,
      content: flattenedContent
    };

    doc.render(renderData);

    const generatedDoc = doc.getZip().generate({ type: 'nodebuffer' });

    res.setHeader('Content-Disposition', 'attachment; filename=MyReport.docx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(generatedDoc);

  } catch (error) {
    console.error('Ошибка при генерации документа:', error);
    res.status(500).json({ message: 'Произошла ошибка на сервере' });
  }
});

// 5. Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер успешно запущен на порту ${PORT}`);
});