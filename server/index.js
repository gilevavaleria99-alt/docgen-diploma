// 1. Подключаем библиотеки
const express = require('express');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');
const ImageModule = require('docxtemplater-image-module-free');
const angularParser = require("docxtemplater/expressions.js");
const { Pool } = require('pg');
const sizeOf = require('image-size');

// 2. Настройки подключения (ЛОКАЛЬНЫЕ)
const pool = new Pool({
  user: 'postgres',
  password: '24092025', // Твой локальный пароль
  host: 'localhost',
  port: 5432,
  database: 'akademik_db'
});

// 3. Настройки приложения
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const PORT = 5000;

// 4. CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  next();
});

// ================= МАРШРУТЫ БАЗЫ ДАННЫХ =================

// 1. Получить список отчетов (ТОЛЬКО ДЛЯ КОНКРЕТНОГО КЛИЕНТА)
app.get('/reports', async (req, res) => {
  const { clientId } = req.query; 
  
  console.log("ЗАПРОС СПИСКА. Получен clientId:", clientId);

  try {
    if (!clientId) {
        console.log("ID не получен, возвращаю пустоту.");
        return res.json([]);
    }

    const result = await pool.query(
      'SELECT * FROM reports WHERE client_id = $1 ORDER BY updated_at DESC', 
      [clientId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения списка:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// 2. Получить один отчет
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

// 3. Сохранить отчет
app.post('/reports', async (req, res) => {
  const { id, meta, content, clientId } = req.body;
  
  // Логируем для отладки
  console.log(`Попытка сохранения. Отчет: ${id}, Клиент: ${clientId}, Размер контента: ${JSON.stringify(content).length} символов`);

  const title = meta.title || 'Новый отчет';
  const student_name = meta.studentName || '';
  const student_group = meta.studentGroup || '';

  try {
    // ПРИНУДИТЕЛЬНО превращаем объекты в JSON-строки перед отправкой в БД
    // Это самый надежный способ для больших объемов данных
    const metaDataJson = JSON.stringify(meta);
    const contentDataJson = JSON.stringify(content);

    let result;
    if (id === 'new') {
      result = await pool.query(
        `INSERT INTO reports (title, student_name, student_group, meta_data, content_data, client_id)
         VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6) RETURNING id`,
        [title, student_name, student_group, metaDataJson, contentDataJson, clientId || 'anonymous']
      );
    } else {
      result = await pool.query(
        `UPDATE reports 
         SET title = $1, student_name = $2, student_group = $3, meta_data = $4::jsonb, content_data = $5::jsonb, client_id = $6, updated_at = NOW()
         WHERE id = $7 RETURNING id`,
        [title, student_name, student_group, metaDataJson, contentDataJson, clientId || 'anonymous', id]
      );
    }
    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('КРИТИЧЕСКАЯ ОШИБКА БД:', error.message);
    // Если ошибка всё равно лезет, выведем кусочек проблемного JSON в логи сервера
    res.status(500).json({ message: 'Ошибка при записи в базу данных' });
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

// 5. ДУБЛИРОВАТЬ ОТЧЕТ
app.post('/reports/duplicate/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Получаем оригинал
    const original = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
    if (original.rows.length === 0) return res.status(404).json({ message: 'Отчет не найден' });
    
    const report = original.rows[0];
    const newTitle = `${report.title} - Копия`;
    
    // 2. Формируем мета-данные для копии
    const newMetaData = { ...report.meta_data, title: newTitle };

    // 3. ПРИНУДИТЕЛЬНО превращаем объекты в JSON-строки (как и при сохранении)
    // Это решит проблему с ошибкой 22P02 при дублировании тяжелых отчетов
    const metaDataJson = JSON.stringify(newMetaData);
    const contentDataJson = JSON.stringify(report.content_data);

    // 4. Вставляем копию с явным приведением типов ::jsonb
    await pool.query(
      `INSERT INTO reports (title, student_name, student_group, meta_data, content_data, client_id)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6)`,
      [
        newTitle, 
        report.student_name, 
        report.student_group, 
        metaDataJson, 
        contentDataJson, 
        report.client_id
      ]
    );

    console.log(`Успешное дублирование отчета ID: ${id}`);
    res.json({ message: 'Отчет дублирован' });
  } catch (error) {
    console.error('ОШИБКА ДУБЛИРОВАНИЯ:', error.message);
    res.status(500).json({ message: 'Ошибка сервера при дублировании' });
  }
});

// 6. ПОЛУЧИТЬ ШАБЛОНЫ
app.get('/templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM templates ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения шаблонов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// ================= ГЕНЕРАЦИЯ DOCX =================

app.post('/generate-docx', (req, res) => {
  try {
    const data = req.body;
    if (!data.content || !Array.isArray(data.content)) data.content = [];

    const templateContent = fs.readFileSync(path.resolve(__dirname, 'template.docx'), 'binary');
    const zip = new PizZip(templateContent);

    const imageOpts = {
      centered: false,
      getImage: (tag) => {
        const base64Data = tag.split(",").pop();
        return Buffer.from(base64Data, 'base64');
      },
      getSize: (imgBuffer) => {
        const dimensions = sizeOf(imgBuffer);
        const maxWidth = 600;

        const ratio = dimensions.width / dimensions.height;

        if (dimensions.width > maxWidth) {
          return [maxWidth, Math.round(maxWidth / ratio)];
        }
        return [dimensions.width, dimensions.height];
      },
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
      const baseBlock = { isHeader: false, isParagraph: false, isList: false, isImage: false };
      switch (block.type) {
        case 'header': return { ...baseBlock, isHeader: true, ...block.data };
        case 'paragraph': return { ...baseBlock, isParagraph: true, ...block.data };
        case 'image': return { ...baseBlock, isImage: true, ...block.data };
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
        default: return baseBlock;
      }
    });

    doc.render({ ...data.meta, content: flattenedContent });
    const generatedDoc = doc.getZip().generate({ type: 'nodebuffer' });
    res.setHeader('Content-Disposition', 'attachment; filename=MyReport.docx');
    res.send(generatedDoc);
  } catch (error) {
    console.error('Ошибка генерации документа:', error);
    res.status(500).json({ message: 'Ошибка генерации' });
  }
});

// 5. Запуск
app.listen(PORT, () => {
  console.log(`Сервер успешно запущен на порту ${PORT}`);
});