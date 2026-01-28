const { Pool } = require('pg');

// Создаем "пул" подключений. 
// Это как группа менеджеров, которые готовы общаться с базой.
const pool = new Pool({
  user: 'postgres',      // Имя пользователя (обычно postgres)
  password: '24092025', // <--- ВНИМАНИЕ! СЮДА ВПИШИ ТОТ ПАРОЛЬ, КОТОРЫЙ ВВОДИЛА В pgAdmin
  host: 'localhost',     // Адрес сервера (твой компьютер)
  port: 5432,            // Стандартный порт PostgreSQL
  database: 'akademik_db' // Имя базы, которую мы создали
});

module.exports = pool;