const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const frontendPath = path.join(__dirname, '..', 'frontend');
const dataDir = path.join(__dirname, 'data');
const commentsFile = path.join(dataDir, 'comments.json');

app.use(express.json({ limit: '20kb' }));
app.use(express.static(frontendPath));

function readComments() {
  try {
    return JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    console.error('Не удалось прочитать комментарии:', error);
    return [];
  }
}

function saveComments(comments) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2), 'utf8');
}

const profile = {
  fullName: 'Дерябин Владислав Дмитриевич',
  group: '4618',
  university: 'ГУАП',
  direction: '09.03.03 Прикладная информатика',
  program: 'Прикладной искусственный интеллект и наука о данных',
  skills: ['Python', 'несколько библиотек Python', 'основы ООП'],
  interests: ['программирование', 'искусственный интеллект', 'наука о данных']
};

app.get('/api/profile', (_req, res) => {
  res.json(profile);
});

// Все сообщения гостевой книги, от новых к старым.
app.get('/api/feedback', (_req, res) => {
  const comments = readComments().sort((a, b) => b.createdAt - a.createdAt);
  res.json(comments);
});

app.post('/api/feedback', (req, res) => {
  const sender = String(req.body.sender || '').trim();
  const message = String(req.body.message || '').trim();

  if (!sender || !message) {
    return res.status(400).json({ error: 'Заполните имя и сообщение.' });
  }
  if (sender.length > 80 || message.length > 1000) {
    return res.status(400).json({ error: 'Слишком длинное сообщение.' });
  }

  const comments = readComments();
  const comment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender,
    message,
    createdAt: Date.now()
  };
  comments.push(comment);

  try {
    saveComments(comments);
    return res.status(201).json({
      message: 'Спасибо! Комментарий опубликован.',
      comment
    });
  } catch (error) {
    console.error('Не удалось сохранить комментарий:', error);
    return res.status(500).json({ error: 'Не удалось сохранить комментарий. Попробуйте позже.' });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Сайт запущен на порту ${PORT}`);
});
